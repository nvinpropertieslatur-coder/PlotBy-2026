---
name: plotby-database
description: Build and maintain Plotby's Supabase schema, RLS, pricing history, storage, and geospatial listing queries.
---

# Plotby Database Standards

Use versioned SQL migrations from the start. Tables include `profiles`, `plots`, `plot_contacts`, `plot_images`, `plot_documents`, `plot_price_history`, `plot_favorites`, and `maharashtra_cities`. Use UUID keys, foreign keys, indexes, NUMERIC money, timestamptz, PostGIS, created/updated timestamps, generated TypeScript types, and Supabase Storage.

Enable and test RLS: users manage only authorized listings, public users see only published listings, verification is role-controlled, and private contacts are access-controlled. Never expose service-role keys. Restrict media file types and sizes. Preserve `rate_per_sqft`, `base_amount`, `discount_type`, `discount_value`, `discount_amount`, and `final_amount`; record price history whenever prices change and validate writes server-side.
