# Infrastructure Cost Reduction Plan

**Date:** 2026-09-29
**Current spend:** ~$1,000/month on AWS
**Goal:** ~$20/month (or free)
**Current setup:** 6 EC2 instances (backend, proxy, 4 workers) + RDS Postgres + ElastiCache Redis (cluster mode) + S3

---

## 1. Summary

- **~$15–25/month is realistic** for the whole platform at current scale by running everything on one server.
- **Free is possible** (Oracle Cloud Always Free), with caveats that make it suitable for demos and the hackathon, not paying users.
- **Consolidating is also a correctness fix:** the current multi-server layout can't route traffic or stop apps reliably (section 3).

---

## 2. Where the $1k likely goes

The AWS bill wasn't available to review (no AWS CLI access), so these are the likely sources based on the project's configuration:

| Source | Why it's expensive |
|---|---|
| 6 EC2 instances | Each also pays ~$3.65/month for its public IPv4 address |
| ElastiCache Redis (cluster mode, TLS) | Cluster mode means multiple nodes; usually the most overpriced piece at this scale |
| RDS Postgres | Instance + storage + backups, possibly a Multi-AZ standby |
| Possibly | NAT gateway, data transfer, Docker images accumulating on EBS disks |

**To confirm:** AWS Cost Explorer → *Group by: Service*, then *Usage type*. About five minutes, and it shows exactly where the money goes.

---

## 3. The four worker servers can't work as intended

**Routing.** The proxy forwards every app request to `localhost:<port>` (`proxy/src/index.ts`). It can only reach containers on **its own machine**. An app built by a worker on another server is unreachable.

**Stop/restart.** Stop and restart jobs (including "out of credits" shutdowns) go into the same shared Redis queue (`worker/src/index.ts`). Whichever worker picks one up runs `docker stop` on **its own** machine. If the app lives elsewhere, stopping it silently does nothing.

**Conclusion:** the proxy, the workers and the user app containers must share one machine anyway. Consolidating fixes the design and cuts cost at the same time.

If the "4 workers" are 4 **processes** on one machine (not 4 servers), routing works, but that means 4 concurrent Docker builds, which is a lot of memory.

---

## 4. Recommended: one server (~$15–25/month)

| Piece | Where | Cost |
|---|---|---|
| Backend, proxy, worker, users' app containers | One VPS: Hetzner (ARM, 8–16 GB), or AWS Lightsail 4–8 GB to stay on AWS | ~$8–20 (Hetzner); $24–44 (Lightsail) |
| Redis | Docker on the same server | $0 |
| Postgres | Neon/Supabase free tier, **or** Docker on the server with nightly backups to S3 | $0 |
| Source-code uploads | Keep S3, or Cloudflare R2 (10 GB free) | < $1 |
| DNS + HTTPS for `*.mezo.host` | Cloudflare free plan | $0 |

Prices are approximate; check current rates before choosing.

**Capacity on one machine (RAM is the limit):**
- 8 GB: roughly 10–15 small apps
- 16 GB: roughly double
- Builds: run **1–2 worker processes**, not 4. A Next.js build alone can use 1–2 GB; extra builds wait in the queue.

When one server is no longer enough, see section 8.

---

## 5. Free option: Oracle Cloud Always Free

A 4-core ARM machine with 24 GB RAM at no cost — enough for the whole setup, using free Postgres (Neon/Supabase) and self-hosted Redis.

**Caveats:**
- Free capacity can be hard to get in busy regions.
- Oracle can reclaim instances it considers idle.
- No uptime SLA.
- User apps are built for ARM. Most Node apps are fine; the occasional native dependency isn't.

Good for the hackathon or demos; not recommended for paying users.

---

## 6. Staying on AWS

Minimum realistic cost: **~$45–60/month** — one Graviton EC2 or Lightsail server with Redis and Postgres self-hosted on it. RDS + ElastiCache alone already cost ~$25–40/month before any compute.

---

## 7. Code changes required before moving

| # | Change | Why | Files |
|---|---|---|---|
| 1 | Make Redis cluster mode a setting (e.g. `REDIS_CLUSTER=true`) instead of automatic in production | A normal local Redis must work | `backend/src/billing/billing.service.ts`, `backend/src/logs/logs.controller.ts`, `backend/src/project/project.service.ts`, `worker/src/index.ts`, `proxy/src/index.ts` |
| 2 | Memory/CPU limits and a restart policy on user containers | Currently none: one heavy app can starve the server, and apps don't come back after a reboot. Most important for fitting more apps per server | `worker/src/docker.ts` |
| 3 | Build concurrency as a setting (default 1–2) | 4 concurrent builds need a lot of RAM | `worker/src/index.ts` / PM2 config |
| 4 | Automatic cleanup of old Docker images | Keeps the disk from filling up | `worker/src` |
| 5 | HTTPS for `*.mezo.host` via Cloudflare, or a wildcard Let's Encrypt certificate | The proxy currently reads a single-domain certificate from `/etc/letsencrypt/live/mezo.host/` | `proxy/src/index.ts`, DNS |
| 6 | Nightly Postgres backups | Only if Postgres is self-hosted | new script / cron |

---

## 8. Scaling past one server (later)

To run app containers on more than one server, routing must store `host:port` instead of just `port`, and stop/restart jobs must be sent to the server that owns the container (per-server queues). Not needed at current scale.

---

## 9. Migration outline

1. Check Cost Explorer to confirm the current breakdown.
2. Make the code changes in section 7 (1–4 at minimum).
3. Provision the new server; install Docker, Node.js, PM2.
4. Run Redis in Docker; create the Postgres database (free tier or Docker).
5. Migrate data: `pg_dump` from RDS → restore into the new Postgres; run `npx prisma migrate deploy`.
6. Deploy backend, proxy and worker with PM2; set `REDIS_URL` / `DATABASE_URL` to the new services.
7. Point DNS (`mezo.host`, `*.mezo.host`, `api.mezo.host`) to the new server via Cloudflare.
8. Redeploy existing user apps (their containers lived on the old servers).
9. Watch for a few days, then shut down the EC2 instances, RDS and ElastiCache — and release their public IPs and snapshots so they stop billing.

---

## 10. Security note

During this review, part of the GitHub App private key (present in `backend/.env`, `backend/.env-prod` and `worker/.env`) was printed into a local session log by mistake. It wasn't sent anywhere else, but **rotate the GitHub App private key** in the GitHub App settings as a precaution. The worker also doesn't need the GitHub key, database URL or JWT secret — give it only what it uses: `REDIS_URL`, `BACKEND_URL`, `WORKER_SECRET`, `ENCRYPTION_SECRET`, `NODE_ENV`, and the S3 settings (`AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_S3_BUCKET_NAME`).
