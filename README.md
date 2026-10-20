# Лабораторная 4 — веб-сервис расчёта расхода кладочных материалов (авторизация + Swagger)

NestJS + TypeORM (PostgreSQL) + MinIO + Redis. Все методы начинаются с `/api`.
Авторизация — сессии в Redis и кука `masonry-material-session-id` (HttpOnly, 1 час).
Создатель услуги заполняется автоматически пользователем из сессии.

## Запуск

```bash
docker compose up -d
npm install
npm install @nestjs/swagger cookie-parser ioredis
npm install -D @types/cookie-parser
npm run start:dev
```

Swagger: http://localhost:3000/api/docs

## Авторизация

1. `POST /api/users/login` проверяет имя и пароль, создаёт сессию в Redis и ставит куку `masonry-material-session-id`.
2. Глобальный guard `MasonryMaterialAuthGuard` по куке находит сессию в Redis и прикрепляет пользователя к запросу.
3. Методы чтения (список, лента) и регистрация/вход доступны гостю (`@MasonryMaterialPublic()`), остальные — только с сессией, иначе **401**.
4. Изменять и удалять можно только свои услуги, чужая услуга — **403**.
5. `POST /api/users/logout` удаляет сессию из Redis и куку.

Сессия в Redis: ключ `masonry-material-session:<id сессии>`, значение — пользователь `{"id":2,"fullName":"Иван Петров"}`, срок — 1 час.

```bash
docker exec -it masonry-material-redis redis-cli
KEYS *
GET masonry-material-session:<id сессии>
TTL masonry-material-session:<id сессии>
```

## HTTP-методы

### Домен услуги

| Метод | URL | Доступ | Запрос | Ответ |
|---|---|---|---|---|
| GET | `/api/masonry-materials?maxConsumption=200` | все | — | 200, массив услуг (только опубликованные, фильтр «расход ≤ значения»); у гостя `isMine` и `isLiked` = 0 |
| GET | `/api/masonry-materials/feed?id=2&next=true` | все | — | 200, одна опубликованная услуга: `?next=true` без `id` — первая, с `id` — эта, с `id` и `next=true` — следующая по кругу; 400 — без параметров; 404 |
| GET | `/api/masonry-materials/draft` | с сессией | — | 200, черновик текущего пользователя; 401; 404 — черновика нет |
| POST | `/api/masonry-materials` | с сессией | form-data: `name`, `image` (файл), `video` (файл) | 201, созданный черновик (создатель — из сессии); 400; 401; 409 — черновик уже есть или название занято |
| PUT | `/api/masonry-materials/:id/publish` | создатель | JSON: `shortDescription`, `mortarPerM3`, `consumptionPerM3` | 200, опубликованная услуга; 400; 401; 403 — чужая услуга; 404; 409 — уже опубликована |
| DELETE | `/api/masonry-materials/:id` | создатель | — | 200 без тела (soft delete); 401; 403 — чужая услуга; 404 |
| POST | `/api/masonry-materials/:id/like` | с сессией | JSON: `{ "value": 1 }` / `{ "value": 0 }` | 200, услуга с обновлёнными `likesCount` и `isLiked`; 400; 401; 404 |

Объект услуги в ответах — всегда одинаковый набор полей (пустые значения — `null`):

| Поле | Тип | Описание |
|---|---|---|
| id | number | идентификатор |
| name | string | наименование |
| shortDescription | string \| null | краткое описание |
| imageUrl | string | ссылка на изображение в MinIO |
| videoUrl | string | ссылка на видео в MinIO |
| mortarPerM3 | number \| null | раствор на 1 м³ кладки, м³ |
| consumptionPerM3 | number \| null | расход, шт./м³ |
| createdAt | string (дата) | дата создания |
| publishedAt | string (дата) \| null | дата формирования |
| isMine | 0 \| 1 | 1 — создатель совпадает с текущим пользователем |
| likesCount | number | количество лайков |
| isLiked | 0 \| 1 | 1 — текущий пользователь поставил лайк |

### Домен пользователь

| Метод | URL | Доступ | Запрос | Ответ |
|---|---|---|---|---|
| POST | `/api/users/register` | все | JSON: `fullName`, `password` | 201 `{ id, fullName }`; 400; 409 — имя занято |
| POST | `/api/users/login` | все | JSON: `fullName`, `password` | 200 `{ id, fullName }` + кука `masonry-material-session-id`; 400; 401 — неверное имя или пароль |
| POST | `/api/users/logout` | с сессией | — | 200 без тела, сессия и кука удалены; 401 |

Ошибки возвращаются только кодом состояния, без тела.

### Бизнес-правила

- Удалённые услуги клиенту не передаются.
- Создатель услуги берётся из сессии, с клиента не передаётся.
- Смена статуса только двумя методами создателя: `черновик → опубликован` (PUT publish) и `черновик/опубликован → удалён` (DELETE). Вернуть в черновик нельзя.
- Системные поля (id, статус, создатель, даты создания и формирования) с клиента не принимаются — 400.
- Файлы изображения и видео хранятся в MinIO под сгенерированными латинскими именами (`masonry-material-image-<uuid>.jpg`), в БД сохраняются имена файлов.

## Таблицы БД

### masonry_material_users — пользователи

| Поле | Тип | Ограничения |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| full_name | VARCHAR(100) | NOT NULL, UNIQUE |
| password | VARCHAR(100) | NOT NULL |

### masonry_material_services — услуги (кладочные материалы)

| Поле | Тип | Ограничения |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(150) | NOT NULL, UNIQUE — наименование |
| short_description | TEXT | краткое описание |
| status | VARCHAR(16) | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','published','deleted') |
| image_url | VARCHAR(255) | NOT NULL — имя файла изображения в MinIO |
| video_url | VARCHAR(255) | NOT NULL — имя файла видео в MinIO |
| mortar_per_m3 | NUMERIC(6,3) | раствор на 1 м³ кладки, м³ |
| consumption_per_m3 | INTEGER | расход, шт./м³ |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() — дата создания |
| published_at | TIMESTAMP | дата формирования |
| creator_id | INTEGER | NOT NULL, FOREIGN KEY → masonry_material_users(id) |

Частичный уникальный индекс `masonry_material_one_draft_per_user (creator_id) WHERE status = 'draft'` — не более одного черновика на пользователя.

### masonry_material_likes — лайки (М-М пользователь-услуга)

| Поле | Тип | Ограничения |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → masonry_material_users(id) |
| service_id | INTEGER | NOT NULL, FOREIGN KEY → masonry_material_services(id) |
| — | — | UNIQUE (user_id, service_id) |

Каскадное удаление не используется.
