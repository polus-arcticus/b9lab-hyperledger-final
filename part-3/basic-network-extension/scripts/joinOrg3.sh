export CORE_PEER_LOCALMSPID="OwnerOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/peers/peerOrganizations/owner-org/peers/peer0.owner-org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/peers/peerOrganizations/owner-org/users/Admin@owner-org/msp
export CORE_PEER_ADDRESS=peer0.owner-org:7051
export ORDERER_CA=/peers/ordererOrganizations/orderer-org/orderers/orderer0.orderer-org/msp/tlscacerts/tlsca.orderer-org-cert.pem
export CHANNEL_NAME=caldera

peer channel fetch 0 caldera.block -o orderer0:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
peer channel join -b caldera.block
peer chaincode install -n caldera -v v2 -p caldera

