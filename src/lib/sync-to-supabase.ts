import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getAdminMockStore } from "@/lib/admin-mock-store";

/**
 * Push website/admin mock store content into Supabase.
 * Requires migration 011 grants (anon can write CMS tables).
 */
export async function syncWebsiteContentToSupabase(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured in .env" };
  }

  const store = getAdminMockStore();
  const errors: string[] = [];

  const run = async (label: string, fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await fn();
    if (error) errors.push(`${label}: ${error.message}`);
  };

  await run("settings", () =>
    supabase.from("settings").upsert({
      id: 1,
      site_name: store.settings.site_name,
      logo_url: store.settings.logo_url,
      favicon_url: store.settings.favicon_url,
      primary_color: store.settings.primary_color,
      contact_email: store.settings.contact_email,
      contact_phone: store.settings.contact_phone,
      whatsapp: store.settings.whatsapp,
      address: store.settings.address,
      social_links: store.settings.social_links,
      footer_text: store.settings.footer_text,
      google_analytics_id: store.settings.google_analytics_id,
      payment_razorpay_key: store.settings.payment_razorpay_key || null,
      home_marquee_text: store.settings.home_marquee_text || null,
      seo_default_title: store.settings.seo_default_title,
      seo_default_description: store.settings.seo_default_description,
    })
  );

  // Destinations — only rows with UUID-looking ids or map to stable UUIDs via slug upsert
  for (const d of store.destinations) {
    await run(`destination:${d.slug}`, () =>
      supabase.from("destinations").upsert(
        {
          name: d.name,
          slug: d.slug,
          state: d.state,
          country: d.country,
          image_url: d.image_url,
          cover_image_url: d.cover_image_url,
          is_featured: d.is_featured,
          is_visible: d.is_visible,
          sort_order: d.sort_order,
        },
        { onConflict: "slug" }
      )
    );
  }

  for (const c of store.categories) {
    await run(`category:${c.slug}`, () =>
      supabase.from("trip_categories").upsert(
        {
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          description: c.description,
          season: c.season,
          sort_order: c.sort_order,
          is_visible: c.is_visible,
        },
        { onConflict: "slug" }
      )
    );
  }

  // Resolve category/destination ids from Supabase by slug for trips
  const { data: destRows } = await supabase.from("destinations").select("id, slug");
  const { data: catRows } = await supabase.from("trip_categories").select("id, slug");
  const destBySlug = Object.fromEntries((destRows ?? []).map((d) => [d.slug, d.id]));
  const catBySlug = Object.fromEntries((catRows ?? []).map((c) => [c.slug, c.id]));

  for (const t of store.trips) {
    const destination_id =
      destBySlug[
        store.destinations.find((d) => d.id === t.destination_id)?.slug ?? ""
      ] ?? null;
    const categorySlug =
      store.categories.find((c) => c.id === t.category_id || c.slug === t.season)?.slug ??
      t.season;
    const category_id = catBySlug[categorySlug ?? ""] ?? null;

    await run(`trip:${t.slug}`, () =>
      supabase.from("trips").upsert(
        {
          title: t.title,
          slug: t.slug,
          destination_id,
          category_id,
          description: t.description,
          overview: t.overview,
          location: t.location,
          duration_days: t.duration_days,
          duration_nights: t.duration_nights,
          price: t.price,
          discount_price: t.discount_price,
          difficulty: t.difficulty,
          max_seats: t.max_seats,
          seats_left: t.seats_left,
          rating: t.rating,
          review_count: t.review_count,
          season: t.season,
          trip_type: t.trip_type ?? "trek",
          highlights: t.highlights,
          altitude: t.altitude,
          is_featured: t.is_featured,
          is_popular: t.is_popular,
          is_trending: t.is_trending,
          is_visible: t.is_visible,
        },
        { onConflict: "slug" }
      )
    );
  }

  const { data: tripRows } = await supabase.from("trips").select("id, slug");
  const tripBySlug = Object.fromEntries((tripRows ?? []).map((t) => [t.slug, t.id]));

  for (const t of store.trips) {
    const tripId = tripBySlug[t.slug];
    if (!tripId || !t.trip_images?.length) continue;
    for (const img of t.trip_images) {
      await run(`trip_image:${t.slug}`, () =>
        supabase.from("trip_images").upsert({
          trip_id: tripId,
          image_url: img.image_url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_cover: img.is_cover,
        })
      );
    }
  }

  for (const s of store.heroSlides) {
    await run(`hero:${s.title}`, () =>
      supabase.from("hero_slides").insert({
        title: s.title,
        subtitle: s.subtitle,
        image_url: s.image_url,
        cta_text: s.cta_text,
        cta_link: s.cta_link,
        secondary_cta_text: s.secondary_cta_text,
        secondary_cta_link: s.secondary_cta_link,
        sort_order: s.sort_order,
        is_visible: s.is_visible,
      })
    );
  }

  for (const g of store.gallery) {
    await run(`gallery:${g.title}`, () =>
      supabase.from("gallery").insert({
        title: g.title,
        image_url: g.image_url,
        video_url: g.video_url,
        media_type: g.media_type,
        category: g.category,
        album: g.album,
        sort_order: g.sort_order,
        is_visible: g.is_visible,
      })
    );
  }

  for (const h of store.highlights) {
    await run(`highlight:${h.title}`, async () => {
      const { data, error } = await supabase
        .from("travel_highlights")
        .insert({
          title: h.title,
          cover_image: h.cover,
          display_order: h.sort_order ?? 0,
          is_active: h.is_visible ?? true,
        })
        .select("id")
        .single();
      if (error) return { error };

      const stories = (h.stories ?? [])
        .filter((s) => s.image)
        .map((s, i) => ({
          highlight_id: data.id,
          image_url: s.image,
          caption: s.caption ?? null,
          display_order: i,
        }));

      if (stories.length) {
        const { error: storyError } = await supabase.from("travel_stories").insert(stories);
        if (storyError) return { error: storyError };
      }
      return { error: null };
    });
  }

  for (const m of store.media) {
    await run(`media:${m.filename}`, () =>
      supabase.from("media_library").insert({
        file_name: m.filename,
        file_url: m.url,
        file_type: m.mime_type,
        file_size: m.size_bytes,
        bucket: m.folder,
        alt_text: m.alt_text,
      })
    );
  }

  for (const t of store.testimonials) {
    await run(`testimonial:${t.name}`, () =>
      supabase.from("testimonials").insert({
        name: t.name,
        location: t.location,
        content: t.content,
        rating: t.rating,
        image_url: t.image_url,
        video_url: t.video_url,
        trip_name: t.trip_name,
        sort_order: t.sort_order,
        is_visible: t.is_visible,
      })
    );
  }

  for (const f of store.faqs) {
    await run(`faq:${f.question.slice(0, 20)}`, () =>
      supabase.from("faq").insert({
        question: f.question,
        answer: f.answer,
        category: f.category,
        sort_order: f.sort_order,
        is_visible: f.is_visible,
      })
    );
  }

  if (errors.length) {
    const permission = errors.some((e) => /permission denied|42501/i.test(e));
    return {
      ok: false,
      message: permission
        ? "Permission denied. Run migration 011_unlock_and_seed_cms.sql in Supabase SQL Editor first."
        : `Partial sync failed: ${errors.slice(0, 3).join(" | ")}`,
    };
  }

  return { ok: true, message: "Website content synced to Supabase" };
}
