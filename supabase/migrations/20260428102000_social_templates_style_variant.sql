alter table public.social_templates
add column if not exists default_style_variant text not null default 'classic-green';

alter table public.social_templates
drop constraint if exists social_templates_default_style_variant_check;

alter table public.social_templates
add constraint social_templates_default_style_variant_check
check (
  default_style_variant in (
    'classic-green',
    'photo-overlay',
    'bold-gold',
    'minimal-board',
    'juniors-energy',
    'sponsor-clean'
  )
);

update public.social_templates
set default_style_variant = 'classic-green'
where default_style_variant is null
   or default_style_variant = '';
