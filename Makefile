up:
	docker-compose up --build

front-up:
	docker-compose -f docker-compose-front-end.yml up --build

down:
	docker-compose down

mongo:
	docker-compose -f docker-compose.mongo.yml up -d

logs:
	docker-compose logs -f

clean:
	docker-compose down -v && docker system prune -f
