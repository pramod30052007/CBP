# Database Setup

## Requirements
- MySQL 8.0+

## Import Instructions
1. Open MySQL Workbench or MySQL CLI
2. Run: `mysql -u root -p < database/schema.sql`
3. Or in MySQL CLI: `source /path/to/schema.sql`

## Default Credentials (after running seed)
- Admin: admin@hotelplatform.com / Admin@123
- Hotel Owner: owner1@example.com / Owner@123
- Worker: worker1@example.com / Worker@123

NOTE: These passwords are stored as bcrypt hashes. The seed data uses placeholder hashes. The real application generates proper hashes during registration.
