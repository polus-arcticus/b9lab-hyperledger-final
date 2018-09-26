docker rmi $(docker images | grep 'dev-artist-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-broker-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-owner-peer-florence-caldera')
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
docker build -t b9-api:latest ./api
docker-compose up