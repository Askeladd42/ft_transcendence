import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'a@a.fr' },
    update: {},
    create: {
      email: 'a@a.fr',
      name: 'Alice',
	  surname: 'Al',
	  nickname: '@l',
      password: {
        create: {
          salted_password: '$2a$10$SPudBGQ5CbaXYTgbWdE4DeEZI9WbxJoVW2XGvPWqpbuwR4Aqxe0AK',
          salt: '$2a$10$SPudBGQ5CbaXYTgbWdE4De',
		  googleAuthLink: null,
		  oAuth42Link: null,
        },
      },
	  admin: 1,
    },
  })
  const bob = await prisma.user.upsert({
    where: { email: 'b@b.fr' },
    update: {},
    create: {
      email: 'b@b.fr',
      name: 'Bob',
	  surname: 'Bo',
	  nickname: 'B',
      password: {
        create: {
          salted_password: '$2a$10$SPudBGQ5CbaXYTgbWdE4DeEZI9WbxJoVW2XGvPWqpbuwR4Aqxe0AK',
          salt: '$2a$10$SPudBGQ5CbaXYTgbWdE4De',
		  googleAuthLink: null,
		  oAuth42Link: null,
        },
      },
	  admin: 0,
	},
  })
  const carl = await prisma.user.upsert({
    where: { email: 'c@c.fr' },
    update: {},
    create: {
      email: 'c@c.fr',
      name: 'Carl',
	  surname: 'Ca',
	  nickname: 'C',
      password: {
        create: {
          salted_password: '$2a$10$SPudBGQ5CbaXYTgbWdE4DeEZI9WbxJoVW2XGvPWqpbuwR4Aqxe0AK',
          salt: '$2a$10$SPudBGQ5CbaXYTgbWdE4De',
		  googleAuthLink: null,
		  oAuth42Link: null,
        },
      },
	  admin: 0,
	},
  })
  console.log({ alice, bob })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })