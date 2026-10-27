# Employee Management System

Java web app to add, view, update and delete employee records (CRUD).

**Stack:** Java 17 · Spring MVC 6 · Spring Security (login + CSRF) · JSP/JSTL · JDBC + HikariCP · MySQL 8 · Apache Tomcat 10.1

## Features
- Admin login (BCrypt, CSRF protection, secure headers)
- Add / view / edit / delete employees with server-side validation
- Dashboard stats, live search, delete confirmation, dark mode, responsive layout
- Output escaping (XSS-safe), friendly error page, least-privilege DB user

## Configuration (environment variables — no secrets in the repo)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_PASSWORD` | yes | – | MySQL password |
| `DB_USERNAME` | no | `ems_app` | MySQL user |
| `DB_URL` | no | `jdbc:mysql://localhost:3306/ems?...` | JDBC URL |
| `EMS_ADMIN_PASSWORD` | yes (min 8 chars) | – | Admin login password |
| `EMS_ADMIN_USER` | no | `admin` | Admin username |

## Run locally

1. Create the database and a limited user:
   ```sql
   SOURCE src/main/resources/schema.sql;
   CREATE USER 'ems_app'@'localhost' IDENTIFIED BY '<strong-password>';
   GRANT SELECT, INSERT, UPDATE, DELETE ON ems.* TO 'ems_app'@'localhost';
   ```
2. Build: `mvn package` → `target/ems.war`
3. Set the env variables above (for Tomcat: put `set "DB_PASSWORD=..."` lines in `bin/setenv.bat`, or `export` them in `bin/setenv.sh`).
4. Copy `ems.war` into Tomcat 10.1 `webapps/` and start Tomcat.
5. Open http://localhost:8080/ems/employees and sign in.

## Behind HTTPS / a reverse proxy (Cloudflare Tunnel, nginx, …)
Add to `conf/server.xml` inside `<Host>`:
```xml
<Valve className="org.apache.catalina.valves.RemoteIpValve" protocolHeader="X-Forwarded-Proto" />
```
Quick public link for demos (temporary, no account needed):
```
cloudflared tunnel --url http://localhost:8080
```
Then share `https://<random>.trycloudflare.com/ems`.

## Notes
- Cloudflare Pages/Workers cannot run Java/MySQL apps; use a tunnel, a VPS, or a Java host (Render, Railway, Fly.io, AWS) for a permanent URL.
- Single admin account; add login-attempt throttling and a user table before multi-user use.
