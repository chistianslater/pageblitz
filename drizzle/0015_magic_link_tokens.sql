-- Magic Link Login: token storage table
CREATE TABLE `magic_link_tokens` (
  `id` int AUTO_INCREMENT NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `redirectUrl` varchar(512) NOT NULL DEFAULT '/my-website',
  `expiresAt` timestamp NOT NULL,
  `usedAt` timestamp,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `magic_link_tokens_id` PRIMARY KEY(`id`),
  CONSTRAINT `magic_link_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
