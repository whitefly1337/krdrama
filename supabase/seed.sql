-- Demo catalog for previews. Safe to run more than once (it skips existing titles).
-- Videos are public sample files; replace them from the admin panel.

do $$
declare
  s_id uuid;
  bunny constant text := 'https://media.w3.org/2010/05/sintel/trailer.mp4';
  elephants constant text := 'https://vjs.zencdn.net/v/oceans.mp4';
  i integer;
begin
  if not exists (select 1 from public.series where title = 'Moonlit Contract') then
    insert into public.series (title, description, poster_url, backdrop_url, format, genre, is_featured, is_published)
    values (
      'Moonlit Contract',
      'A chaebol heir and a struggling pianist sign a one-year marriage contract — and neither expects to fall in love.',
      'https://picsum.photos/seed/moonlit/600/900',
      'https://picsum.photos/seed/moonlit-bg/1280/720',
      'vertical', 'Romance', true, true
    )
    returning id into s_id;

    for i in 1..8 loop
      with ep as (
        insert into public.episodes (series_id, title, episode_number, thumbnail_url, duration, is_free)
        values (s_id, 'Episode ' || i, i, 'https://picsum.photos/seed/moonlit-' || i || '/640/360', 90, i <= 2)
        returning id
      )
      insert into public.episode_media (episode_id, video_source) select id, bunny from ep;
    end loop;
  end if;

  if not exists (select 1 from public.series where title = 'Seoul Shadows') then
    insert into public.series (title, description, poster_url, backdrop_url, format, genre, is_featured, is_published)
    values (
      'Seoul Shadows',
      'A rookie detective discovers her new partner has been dead for ten years.',
      'https://picsum.photos/seed/seoul/600/900',
      'https://picsum.photos/seed/seoul-bg/1280/720',
      'horizontal', 'Thriller', true, true
    )
    returning id into s_id;

    for i in 1..5 loop
      with ep as (
        insert into public.episodes (series_id, title, episode_number, thumbnail_url, duration, is_free)
        values (s_id, 'Episode ' || i, i, 'https://picsum.photos/seed/seoul-' || i || '/640/360', 600, i = 1)
        returning id
      )
      insert into public.episode_media (episode_id, video_source) select id, elephants from ep;
    end loop;
  end if;
end $$;
