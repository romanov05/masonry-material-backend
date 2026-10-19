# Лабораторная 3 — веб-сервис расчёта расхода кладочных материалов

NestJS + TypeORM (PostgreSQL) + MinIO. Все методы начинаются с `/api`.
Текущий пользователь до лабораторной №4 зафиксирован функцией-singleton `getMasonryMaterialCurrentUserId()` (id = 2).

## Запуск

```bash
docker compose up -d
npm install
npm run start:dev
```

## HTTP-методы

### Домен услуги

| Метод | URL | Запрос | Ответ |
|---|---|---|---|
| GET | `/api/masonry-materials?maxConsumption=200` | — | 200, массив услуг (только опубликованные, фильтр «расход ≤ значения») |
| GET | `/api/masonry-materials/feed?id=2&next=true` | — | 200, одна опубликованная услуга: с `id` — эта, с `id` и `next=true` — следующая по кругу; 400 — без `id` (без параметров метод не работает); 404 |
| GET | `/api/masonry-materials/draft` | — | 200, черновик текущего пользователя; 404, если черновика нет |
| POST | `/api/masonry-materials` | form-data: `name`, `image` (файл), `video` (файл) | 201, созданный черновик; 400; 409 — черновик уже есть или название занято |
| PUT | `/api/masonry-materials/:id/publish` | JSON: `shortDescription`, `mortarPerM3`, `consumptionPerM3` | 200, опубликованная услуга; 400; 404 — нет такого черновика у пользователя |
| DELETE | `/api/masonry-materials/:id` | — | 200 без тела (soft delete); 404 |
| POST | `/api/masonry-materials/:id/like` | JSON: `{ "value": 1 }` / `{ "value": 0 }` | 200, услуга с обновлёнными `likesCount` и `isLiked`; 404 |

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

| Метод | URL | Запрос | Ответ |
|---|---|---|---|
| POST | `/api/users/register` | JSON: `fullName`, `password` | 201 `{ id, fullName }`; 400; 409 — имя занято |
| POST | `/api/users/login` | JSON: `fullName`, `password` | 200 без тела (заглушка до лабораторной №4) |
| POST | `/api/users/logout` | — | 200 без тела (заглушка до лабораторной №4) |

Ошибки возвращаются только кодом состояния, без тела.

### Бизнес-правила

- Удалённые услуги клиенту не передаются.
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
