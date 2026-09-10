-- ===========================================
-- 1. SEED 20 TEAMS INTO "Team" TABLE
-- ===========================================

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmsxjsr5q003t76w2w2uytx1h', 'Alpha Coders', 'TEAM001', 'PROBLEM_SELECTED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmsxjss8q003z76w2e8i7zsb7', 'Byte Builders', 'TEAM002', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmsxjssz6004576w2xp2t4vxm', 'Cyber Mavericks', 'TEAM003', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7dcu003v76vmoc648l0b', 'Team 004', 'TEAM004', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7dsm003w76vmmm3s0eb5', 'Team 005', 'TEAM005', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7e6y003x76vm71bzwii8', 'Team 006', 'TEAM006', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7elf003y76vmqdfe4ua6', 'Team 007', 'TEAM007', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7f34003z76vm8jvdg5j3', 'Team 008', 'TEAM008', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7fhb004076vmo5ajrmtd', 'Team 009', 'TEAM009', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7fum004176vmywgham7n', 'Team 010', 'TEAM010', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7g87004276vmoqb3q4ud', 'Team 011', 'TEAM011', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7gm6004376vms3pjnokb', 'Team 012', 'TEAM012', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7h0y004476vm23o3k49v', 'Team 013', 'TEAM013', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7hev004576vmwfzcsr38', 'Team 014', 'TEAM014', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7hsr004676vmz70l0khp', 'Team 015', 'TEAM015', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7i6n004776vmrnkibz78', 'Team 016', 'TEAM016', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7ik7004876vmduy6c4co', 'Team 017', 'TEAM017', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7ixi004976vmjzqe11nc', 'Team 018', 'TEAM018', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7jb6004a76vm7j3zogzg', 'Team 019', 'TEAM019', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Team" ("id", "name", "teamId", "status", "submissionStatus", "createdAt", "updatedAt")
VALUES ('cmtvv7joy004b76vmyvs7hjok', 'Team 020', 'TEAM020', 'REGISTERED', 'NOT_SUBMITTED', NOW(), NOW())
ON CONFLICT ("teamId") DO UPDATE SET "name" = EXCLUDED."name";


-- ===========================================
-- 2. SEED USERS INTO "User" TABLE
-- ===========================================

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmsxjss33003x76w2hsq1b1b0', 'TEAM001', '$2a$12$PsNLe/eFoFemvuKopOnNWeQeEJDBUslbxunMcPN4k3qNR0xEAK.4u', 'team001@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM001' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmsxjsswc004376w2gumeewjk', 'TEAM002', '$2a$12$hsPeaZgsVhjUMWgMzQykj.vsMbWN5TTFxHqBoYA0JD4IgKXhSwBe6', 'team002@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM002' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmttjgy2o000b76hg9v4zwt15', 'TEAM003', '$2a$12$/ANsjJJcBSRpb1FaXu6KOOFVivjGx0cnAJ.ta5XoqujhGjmYpa0pe', NULL, 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM003' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdn8l000r765oic4mmegl', 'TEAM004', '$2a$12$QgagDBGHYhhd37dJkwALguiNsWGlJhWvtcoUq1pksNGU1OjS/rYoy', 'team004@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM004' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdnq8000t765ov0ggj2zx', 'TEAM005', '$2a$12$en2un7ktV113VvLNxmjM0eJCwqF4zH9Y0lUXKyXLVKdwOxflMq9Pu', 'team005@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM005' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdo7z000v765ohextylw8', 'TEAM006', '$2a$12$q./DA4sZ1Nlk5KpVQH8YEeUiXjh.AD.XlZoUTfoKAir.2TYQuVELm', 'team006@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM006' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdpcv000x765odzu958ij', 'TEAM007', '$2a$12$wqZNY7Ao9Sihs1pwu/GzsOOJPwizgL40UTasnLl2dAVPIAvKzJtRC', 'team007@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM007' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdpuh000z765ot52h0b8h', 'TEAM008', '$2a$12$xVSMi8R9DE4vPRMz1fKM2u57Uh1JWxQHnWzplh9R6lnGyJIZqaF.y', 'team008@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM008' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdqbq0011765omfhatruc', 'TEAM009', '$2a$12$0tj7xArj1KrB0QKPFyePmOVvTbrsKv20n7HELH4w363C9uvPTP0HG', 'team009@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM009' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdqu10013765otqr8yy3n', 'TEAM010', '$2a$12$sKXJuXYxkoY/dn3PI9lME.lV/zN.u1jpIiA44ndnNUpfQyAVsTM2e', 'team010@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM010' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdrbp0015765olyjj8ufq', 'TEAM011', '$2a$12$R5N.MflzdRCOOe1IFmBNL.1W0Ryi8ZoMhc6RknZnWkpI.JZJkVJsq', 'team011@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM011' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdrub0017765oas8twvau', 'TEAM012', '$2a$12$0SRFWBjd/FGz079TPj3wD.sl.PvtXLDC4q7txkhN0boJYJrTxf0IW', 'team012@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM012' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdsc80019765o7feellcq', 'TEAM013', '$2a$12$7lglZyb7kq99/88liG3/xOVIv2cN9ll5UrVT0MK8fOPtH26XQHXgy', 'team013@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM013' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdsu5001b765o7dx1kz0t', 'TEAM014', '$2a$12$S6h4oeF/O1ZrJHiQekGameqoLUGWJzBD4K6rY4L/pMFRDDaNqnLtu', 'team014@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM014' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdtce001d765ox7yzcs8a', 'TEAM015', '$2a$12$ZcY49Rh1.uGNTQoBzh16Tuzn.p2PR7a47c83PfWhC9CRkUJnM1vqm', 'team015@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM015' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdtu8001f765oje5hjzg4', 'TEAM016', '$2a$12$Z4TMfdDeBDGU.3cu6y2TpeY3CU8/22ltvE3DCE4JmeMEa2FeaID6u', 'team016@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM016' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvduce001h765o7lcrtjiz', 'TEAM017', '$2a$12$enQAeYNFdOoijpjjyjsQdO406S1Wp3Fh/gmS/BIpSDoMMeNmZ2DB.', 'team017@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM017' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvduuo001j765o2yffjxfd', 'TEAM018', '$2a$12$9RFbMVbtFuEQ7icI6mDC2uFDtaS1/SQ9Kb4.6EtcSuHar7g/FnH0C', 'team018@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM018' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdvck001l765o3ynm8mmc', 'TEAM019', '$2a$12$PaEp.ZuEv6TwH8Wxc2TGNuiHYA0XHFZ/jzl6t/7BYNzi1.SgoYGEK', 'team019@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM019' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvvdvus001n765o08htb98x', 'TEAM020', '$2a$12$ByZwLI4OE17IWUodKyD7muUcuNR4LrtEjjK40x/JwQohoUoNJORVW', 'team020@hackathon.com', 'TEAM', 'ACTIVE', (SELECT "id" FROM "Team" WHERE "teamId" = 'TEAM020' LIMIT 1), NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kdm004c76vml1zv3dia', 'admin01', '$2a$12$gA/jdI6Nc9F1l7/jzmC2j.3vcfbOS1Ad6vGTc9mTzRWP.RXBhaby.', 'admin01@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kjf004d76vm5fr458qj', 'admin02', '$2a$12$Gnq8DRayg5YyaLg5Qlb.pOE840jMJ5Hrh7/vNBx.s/QVE78BkiPmO', 'admin02@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kmb004e76vmcjrmiian', 'admin03', '$2a$12$p3bK6UfNc0769dpJaeQTWOAY26KRctmSn.UgnwoLui8uWj2DPP3wK', 'admin03@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kp7004f76vmh5qzzyzy', 'admin04', '$2a$12$dfJfuk1G4O6Uf1HV/JQGke11ivNKfGaZ6y7.cU7C7Zq8QhPPosWS2', 'admin04@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7ks0004g76vm3mw8x0b4', 'admin05', '$2a$12$orVmk2vUo1xEjc1sbfqbbOXuAomq9tDSXKGg3udzbiqDxI14Wsu2y', 'admin05@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kuq004h76vm9y9cn3am', 'admin06', '$2a$12$8Bsp8YR.ujuITBSw/j0ApuGk1NT2..Ws/xzaUTKvDU6B4qHqnK1bm', 'admin06@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7kxf004i76vmxwz0fspt', 'admin07', '$2a$12$7a12ieTyzC94QE08Ybtz0eo4R5SwPvEf7grS/jdSKQ8agI1VUFLqe', 'admin07@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7l03004j76vmgx4qlqjk', 'admin08', '$2a$12$yemo1i3kEM2KqNocajP44O6dj0rXBzUHPSobjtrjOVpEJla733KLu', 'admin08@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7l2y004k76vmrfepd85e', 'admin09', '$2a$12$nNBYWEVPqEkKJrRfBDThC.RAJElF81QPzk4c8jVJ2bsylz3Uwz7a6', 'admin09@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7l5s004l76vmhp4e3m2f', 'admin10', '$2a$12$XTqxw7HZzdQ7qe6H1eOHXuR9bUZBa/.JkO73lRBIAiRfky3pJqcq.', 'admin10@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7l8k004m76vmbexd28x3', 'admin11', '$2a$12$9vDzjLNWyRiamLt66gejt.H.vsLJFp4VkqzgliS3x4e2qPQ8/js2W', 'admin11@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7lb9004n76vmig9fgip2', 'admin12', '$2a$12$/LxVJkDjuz2A9BwoOVx2O.O.MxQLpFUmMpmNnKvCQkGvsq0a0H3a.', 'admin12@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7le4004o76vm3trysa1v', 'admin13', '$2a$12$.fviq.4FsOCgkCvzydrOFu2Kpxpv4sAHR6hsJ42QeNG9pN08wOob.', 'admin13@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7lgs004p76vmeu1js4qo', 'admin14', '$2a$12$rnjmlqR2yg26v73WQv4Qh.b5uH/ywwKpJPOSwZyP6mPhFT77qZJCa', 'admin14@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7ljp004q76vm3vwzxvmk', 'admin15', '$2a$12$iJYlQWjHisco.vyM5vdFAOORVjRhYe47A3S0RdUU61ERhdYGmVCHy', 'admin15@hackathon.com', 'ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7ly1004r76vm89qtsicw', 'superadmin01', '$2a$12$02A92OW2ZVLFYd2GMRuqsuio3WQylSALmvA0jXWkk1PEEGBpfS342', 'superadmin01@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7m1x004s76vm62zmb6fo', 'superadmin02', '$2a$12$ia34fLfQ6oWjBMs90kNeJOvKuft6L4/4Vi3fgoF2J66jj3zPDGsAa', 'superadmin02@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7m4m004t76vmzhx053g1', 'superadmin03', '$2a$12$S3IqNW5uVyB5Bss8txJR3uTaQYWAd/7yKNHBfKazl4fVTVZgNDejC', 'superadmin03@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7m7o004u76vm4oghzte4', 'superadmin04', '$2a$12$KDDNpDEhKog1oYNE5RKPK.KqLO4w8UwLH4j1cxVOQBonpUE8MuSoe', 'superadmin04@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

INSERT INTO "User" ("id", "username", "password", "email", "role", "status", "teamId", "createdAt", "updatedAt")
VALUES ('cmtvv7mac004v76vmfttjfo7s', 'superadmin05', '$2a$12$WaQRE/hitnXCJV5/jM1SveEha75wR6JLjhCPxFymmfHUFZY.zFfnC', 'superadmin05@hackathon.com', 'SUPER_ADMIN', 'ACTIVE', NULL, NOW(), NOW())
ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role", "status" = EXCLUDED."status", "teamId" = EXCLUDED."teamId";

