up:
	docker-compose up --build

down:
	docker-compose down

mongo:
	docker-compose -f docker-compose.mongo.yml up -d

logs:
	docker-compose logs -f

clean:
	docker-compose down -v && docker system prune -f
