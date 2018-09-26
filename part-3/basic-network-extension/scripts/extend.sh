#!/bin/bash

# export env variables to map our configtlator, channel and orderer_ca
export CONFIGTXLATOR_URL=http://127.0.0.1:7059
export ORDERER_CA=/peers/ordererOrganizations/orderer-org/orderers/orderer0.orderer-org/msp/tlscacerts/tlsca.orderer-org-cert.pem
export CHANNEL_NAME=caldera
export BASEPATH=/opt/gopath/src/github.com/hyperledger/fabric

# fetch the config block, call it config_block.pb from orderer for channel with tls upon our orderer ca
peer channel fetch config config_block.pb -o orderer0:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA


# our config block is a unreadable protobuffer, lets use configtx to make it json
curl -X POST --data-binary @config_block.pb "$CONFIGTXLATOR_URL/protolator/decode/common.Block" | jq . > config_block.json

# using jq lets add our first data payload from our config block into a config.json object
jq .data.data[0].payload.data.config config_block.json > config.json

# add the new Org MSP material
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"OwnerOrgMSP":.[1]}}}}}' config.json ../../../../../../../peers/owner-org.json >& updated_config.json

# encode our config.json into pb
curl -X POST --data-binary @config.json "$CONFIGTXLATOR_URL/protolator/encode/common.Config" > config.pb

# encode our updated config json to protobuffer
curl -X POST --data-binary @updated_config.json "$CONFIGTXLATOR_URL/protolator/encode/common.Config" > updated_config.pb

# use these to protobuffers to calculate and generate a delat
curl -X POST -F channel=$CHANNEL_NAME -F "original=@config.pb" -F "updated=@updated_config.pb" "${CONFIGTXLATOR_URL}/configtxlator/compute/update-from-configs" > config_update.pb

# delta to json
curl -X POST --data-binary @config_update.pb "$CONFIGTXLATOR_URL/protolator/decode/common.ConfigUpdate" | jq . > config_update.json

# wrap delta in envelope
echo '{"payload":{"header":{"channel_header":{"channel_id":"caldera", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
# convert envelope to protobuffer
curl -X POST --data-binary @config_update_in_envelope.json "$CONFIGTXLATOR_URL/protolator/encode/common.Envelope" > config_update_in_envelope.pb

# signed this config with artist credentials
peer channel signconfigtx -f config_update_in_envelope.pb
# sign this config with broker credentials
export CORE_PEER_LOCALMSPID="BrokerOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/peers/peerOrganizations/broker-org/peers/broker-peer-florence.broker-org/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/peers/peerOrganizations/broker-org/users/Admin@broker-org/msp
export CORE_PEER_ADDRESS=broker-peer-florence:7051

peer channel signconfigtx -f config_update_in_envelope.pb
# update channel config
peer channel update -f config_update_in_envelope.pb -c $CHANNEL_NAME -o orderer0:7050 --tls true --cafile $ORDERER_CA
echo '#### Channel update Complete, please exit and return to main script'