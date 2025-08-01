-- Check what storage buckets exist
SELECT 
    id,
    name,
    public,
    created_at,
    updated_at
FROM storage.buckets
ORDER BY name;

-- Also check storage.objects to see what's being stored
SELECT 
    bucket_id,
    COUNT(*) as object_count,
    SUM(metadata->>'size')::BIGINT as total_size_bytes
FROM storage.objects
GROUP BY bucket_id;