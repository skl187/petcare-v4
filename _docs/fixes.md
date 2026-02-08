
# With variables
MIGRATION_FILE="db/migrations/001-create-email-verifications.sql"
docker exec -i postgresql psql -U dbadmin -d bracedb26 < $MIGRATION_FILE