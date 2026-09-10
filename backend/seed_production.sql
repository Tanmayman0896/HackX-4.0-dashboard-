-- ===========================================
-- 1. SUPER ADMINS
-- ===========================================

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12gf20000767h4ab9zd0e', 'Tanmay', '$2a$12$YYKrARPcJ34h5TNOTpn2POYns6RGvaj4Bzd2CaeV2qjMZZsyg9O8K', 'tanmay@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12gy30001767hrdlwmbu2', 'Aryan', '$2a$12$bb9ggqrb/V97soxyNcLoQO80uVGWViqkER/H0pICyfrXMg1z0TsvG', 'aryan@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12hcx0002767hrc6rumvz', 'Dolly', '$2a$12$Rt0LAjo/Ed3GpOVIcdAJ.eCQ1EQxj.LZmbyu6Civtb/JgV0Tx5hRa', 'dolly@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12hs30003767hxbnxcyu1', 'Vidhyanshu', '$2a$12$0h1YK7w6ZwaXDGoBW3djLuxQtQNrTbpQxopSch7zc8uV7YWTNbMrq', 'vidhyanshu@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";


-- ===========================================
-- 2. ADMINS
-- ===========================================

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw1a3cu000076dztsn47nil', 'Tanmay-Admin', '$2a$12$AVLC/ezobXg9UMejGtAIsewbhGfAtyXHYpjCobk5fJ0NYCKQ0ll8O', 'tanmay-admin@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw1a3if000176dzu4oh3mbt', 'Dolly-Admin', '$2a$12$Shj1gh2Txqnfcg7.UiAQPePh7G7fcxZi23FS6somZlyIarrOT0xhe', 'dolly-admin@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12i6z0004767hmbbkndas', 'Srijan', '$2a$12$UGBveL499ivca3Ck4/ndCu8nf79SdJR7LHi64eb4QWHBxazvOQ/8G', 'srijan@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12ilq0005767hr0236ssw', 'Pushkar', '$2a$12$DDW8VngrVXKf9VW0H2bABu3sHGd2nBvvfDCgbkEHF4WeahlbZ6mUC', 'pushkar@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12j0k0006767h6kc2xfl6', 'Arindam', '$2a$12$Cf9KbnUWte3tLlBBdFqXyeyF/9Mz0yyFvfvbPACZ.mty0D11fQWH.', 'arindam@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12jfn0007767hvd8ej3y7', 'Anshuman', '$2a$12$yiaBGtF1mvVnmcfF4TmxPOqlf0PmfNgtP3BlBb5s50Qi7MX5XYASm', 'anshuman@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12ju50008767hc12y6e9l', 'Aarush-Chandra', '$2a$12$wLlO/CoPRcn3kTU.Skw37.34IK6HL6LA7Lj9lnX1rOwLvju9qOiLy', 'aarush-chandra@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12k9d0009767hwc8d006s', 'Aarush-Dayal', '$2a$12$E/YMRL6HIhvcQnfyI4CYiuVEBE.Jl.s60B.6cu20ugM8DMlNfDcBO', 'aarush-dayal@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12ko5000a767hiuhfqlpu', 'Abhishek', '$2a$12$I7GouMpS5hZr/Kh1KUt/XeB1Yr1DJtSpPUm86E3pyPhhfX/7IytzS', 'abhishek@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12l2j000b767hcl24p4qp', 'Ayush', '$2a$12$lcEH.l4vldZhDtzS55Y.1.FPLBki1lvq6Alv7BRJF7kH6QvFNju7C', 'ayush@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12lhe000c767hhrot7ew5', 'Dev', '$2a$12$a5M6R/wN1hnjx.x8nCs3ZuYiGmKzpJx7yDdR/T.zDPRDTdNnQHnZO', 'dev@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12lw2000d767h89b1jgul', 'Harsh', '$2a$12$cVLe6LagYv7vpPh8UQx7.ek83FNwUkHscTEz8VRUOXQtGWaVa/iuq', 'harsh@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12mah000e767hvra4nj3f', 'Saksham', '$2a$12$4MjjIOBKAqQNdZR4CrnTHe6qHUseWS2BzZzmOKqZxE4dEqmfIdSfW', 'saksham@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12mp4000f767he57d0qzq', 'Admin01', '$2a$12$i5ceZ0V1Aorxh0DqJvyehe23eN9ZYJVsZlVttDxA4JVY7L/WxkIRG', 'admin01@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "createdAt", "updatedAt")
VALUES ('cmtw12nja000g767hoo3kkfao', 'Admin02', '$2a$12$Ze0WUTicy.xUYgBl2XrH0.dqHdxKA9ZvGQ0pcesyjG/VXSN4ARkhC', 'admin02@hackathon.com', 'ADMIN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status";


-- ===========================================
-- 3. DOMAINS
-- ===========================================

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmsxjsgy0000076w2cw8rqfy8', 'Mobile Development', 'iOS and Android mobile applications', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmsxjshi1000376w2ot67vqfp', 'IoT', 'Internet of Things and embedded systems', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmsxjshi6000476w2qbtvh3y8', 'Web Development', 'Frontend and backend web applications', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmsxjshi0000176w2uyipyh5q', 'AI/ML', 'Artificial Intelligence and Machine Learning solutions', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmsxjshi1000276w20us4fo2d', 'Blockchain', 'Decentralized applications and blockchain solutions', NOW())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Domain" ("id", "name", "description", "createdAt")
VALUES ('cmtvykvam000076u9umrp0jc6', 'Open Innovation', 'Open Innovation and cross-domain solutions', NOW())
ON CONFLICT ("name") DO NOTHING;
