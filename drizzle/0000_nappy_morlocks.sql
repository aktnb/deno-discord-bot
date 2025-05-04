CREATE TABLE "rooms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"voiceChannelId" varchar(32) NOT NULL,
	"textChannelId" varchar(32),
	CONSTRAINT "rooms_voiceChannelId_unique" UNIQUE("voiceChannelId")
);
