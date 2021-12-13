import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { artistsData } from "./songsData";

const prisma = new PrismaClient();

const run = async () => {
    await Promise.all(
        artistsData.map(async (artist) => {
            return prisma.artist.upsert({
                where: { name: artist.name },
                update: {},
                create: {
                    name: artist.name,
                    songs: {
                        create: artist.songs.map((song) => ({
                            name: song.name,
                            duration: song.duration,
                            url: song.url,
                        })),
                    },
                },
            })
        })
    )
    const salt = await bcrypt.genSaltSync();
    const user = await prisma.user.upsert({
        where: { email: "user@test.com" },
        update: {},
        create: {
            email: "user@test.com",
            password: await bcrypt.hash("password", salt),
        },
    })
    const songs = prisma.song.findMany({});
    await Promise.all(new Array(10).fill(0).map(async (_, index) => {
        const song = songs[index];
        await prisma.playlist.create({
            data: {
                name: `Playlist ${index + 1}`,
                user: {
                    connect: { id: user.id },
                },
                songs: {
                    connect: { id: song.id },
                },
            },
        });
    }));
}

run()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
