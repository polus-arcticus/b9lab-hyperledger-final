
rm -rf ./api/certs

mkdir ./api/certs

#test
# cp ./data/tls/peer1-artist-org-client.crt ./api/certs/Admin@artist-org-cert.pem
# cp ./data/tls/peer1-artist-org-client.key ./api/certs/Admin@artist-org-key.pem
cp ./data/orgs/artist-org/admin/msp/keystore/* ./api/certs/Admin@artist-org-key.pem
cp ./data/orgs/artist-org/admin/msp/signcerts/* ./api/certs/Admin@artist-org-cert.pem
cp ./data/orgs/broker-org/admin/msp/keystore/* ./api/certs/Admin@broker-org-key.pem
cp ./data/orgs/broker-org/admin/msp/signcerts/* ./api/certs/Admin@broker-org-cert.pem
cp ./data/channel.tx ./api
# test for artist
cp ./data/artist-org-ca-cert.pem ./api/certs/artist-org-ca-cert.pem
cp ./data/orderer-org-ca-cert.pem ./api/certs/orderer-org-ca-cert.pem
cp ./data/broker-org-ca-cert.pem ./api/certs/broker-org-ca-cert.pem


docker build -t b9-ca-api:latest ./api
docker-compose -f docker-compose-api.yaml up
