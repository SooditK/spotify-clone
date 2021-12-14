import prisma from '../../lib/prisma'
import { validateToken } from '../../lib/auth'

const Playlist = ({playlist}) => {
  return <div>{playlist.name}</div>
}

export const getServerSideProps = ({ query, req }) => {
  const { id } = validateToken(req.cookies.TRAX_ACCESS_TOKEN)
  const [playlist] = prisma.playlist.findMany({
    where: {
      id: +query.id,
      userId: id,
    },
    include: {
      songs: {
        include: {
          artist: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  })
  return {
    props: {
      playlist,
    },
  }
}

export default Playlist
