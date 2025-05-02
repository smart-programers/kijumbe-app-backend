# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```
### Add User to Docker Group
```
grep docker /etc/group
sudo usermod -aG docker revaycolizer
newgrp docker
docker run hello-world
```
### Remove available Containers and Perform Fresh Build of Containers
``` 
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose build --no-cache
docker-compose up

```
```
docker-compose down
docker-compose up -d --force-recreate
```

``` 
docker compose restart nginx
```
``` 
sudo rm /etc/nginx/sites-enabled/kijumbe
sudo rm /etc/nginx/sites-available/kijumbe
```

Update the Containers
``` 
docker-compose up -d --build
```

Open http://localhost:3000/ with your browser to see the result.