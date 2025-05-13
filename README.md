# init turborepo

# extends tsconfig.json from typescript-config/base.json

# add @repo/typescript-config as dependency in pacakge.json file

`for npm "@repo/typescript-config": "*"
for pnpm "@repo/typescript-config": "workspace:*"
and run pnpm install on root level`

- Added a build, dev and start script to both the projects

# Get help

- setting up tailwindCSS : dub.sh repo

# create a cli tool to generate boilerplate

4. Added package.json in both the places
5. Added tsconfig.json in both the places, and imported it from @repo/typescript-config/base.json
6. Added @repo/typescript-config as a dependency in both ws-server and http-server
7. Added a build, dev and start script to both the projects
8. - Update the turbo-config in both the projects (optional)
9. Initialize a http server, Initialize a websocket server

10. Write the signup, signin, create-room endpoint
11. Write the middlewares that decode the token and gate the create-room ep
12. Decode the token in the websocket server as well. Séåd the token to the websocket server in a query param for now

13. - Initialize a new `db` package where you write the schema of the project.
14. - Import the db package in http layer and start putting things in the DB
15. - Add a common package where we add the zod schema and the JWT-SECRET
16. - Defining the schema in schema.prisma

npx prisma init
npx prisma migrate dev --name init_schema
npx prisma generate

17. - Complete the HTTP Backend
18. - ws layer. room management, broadcast messages
19. - HTTP route for GET /chats?room=123
20. - Frontend

part 2 : 1:32:00 ws-architecture
state full ws server
state management on nodejs backend
