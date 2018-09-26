package main

import (
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

var calderaFunctions = map[string]func(shim.ChaincodeStubInterface, []string) pb.Response{
	"create_artist":                 createArtist,
	"create_broker":                 createBroker,
	"create_owner":                  createOwner,
	"register_art":                  registerArt,
	"artist_send_brokerage_request": createArtistBrokerProposal,
	"get_brokerage_requests":        queryBrokerageRequests,
	"approve_brokerage_request":     approveBrokerageRequest,
	"list_broker_inventory":         queryBrokerageInventory,
	"sell_art":                      sellArt,
	"create_user":                   createUser,
}

func (c *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (c *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	calderaFunction := calderaFunctions[function]
	if calderaFunction == nil {
		return shim.Error("Invalid Function")
	}

	return calderaFunction(stub, args)
}

func main() {

	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Chaincode: %s", err)
	}
}
