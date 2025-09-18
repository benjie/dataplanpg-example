create extension citext;
create table users (
  id int primary key generated always as identity,
  username citext not null unique,
  created_at timestamptz not null default now()
);
create table posts (
  id int primary key generated always as identity,
  author_id int not null references users on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

insert into users (username) values ('Alice'), ('Bob'), ('Caroline');

insert into posts (author_id, body) values
  (1, 'Hey! I''m Alice'),
  (2, 'Call me Bob'),
  (3, 'Caroline here!'),
  (1, 'This is my second post'),
  (1, 'Stroopwaffles are great!');
