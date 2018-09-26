export CORE_PEER_LOCALMSPID="ArtistOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/peers/peerOrganizations/artist-org/peers/artist-peer-florence.artist-org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/peers/peerOrganizations/artist-org/users/Admin@artist-org/msp
export CORE_PEER_ADDRESS=artist-peer-florence:7051

peer chaincode install -n caldera -v v2 -p caldera

export CORE_PEER_LOCALMSPID="BrokerOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/peers/peerOrganizations/broker-org/peers/broker-peer-florence.broker-org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/peers/peerOrganizations/broker-org/users/Admin@broker-org/msp
export CORE_PEER_ADDRESS=broker-peer-florence:7051

peer chaincode install -n caldera -v v2 -p caldera

export CORE_PEER_LOCALMSPID="ArtistOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/peers/peerOrganizations/artist-org/peers/artist-peer-florence.artist-org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/peers/peerOrganizations/artist-org/users/Admin@artist-org/msp
export CORE_PEER_ADDRESS=artist-peer-florence:7051
export ORDERER_CA=/peers/ordererOrganizations/orderer-org/orderers/orderer0.orderer-org/msp/tlscacerts/tlsca.orderer-org-cert.pem
export CHANNEL_NAME=caldera

peer chaincode upgrade --tls --cafile $ORDERER_CA -o orderer0:7050 -C $CHANNEL_NAME -n caldera -v v2 -c '{"Args":[]}' -P "AND ('ArtistOrgMSP.peer', 'BrokerOrgMSP.peer')"
