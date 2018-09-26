package main

import (
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	var org3User Org3User
	err := json.Unmarshal([]byte(args[0]), &org3User)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixOrg3User, []string{org3User.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	org3UserAsBytes, _ := stub.GetState(key)

	if len(org3UserAsBytes) == 0 {
		org3UserAsBytes, err = json.Marshal(org3User)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(key, org3UserAsBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
		response := struct {
			Message string
		}{
			Message: "Registered!",
		}

		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(responseAsBytes)
	} else {
		response := struct {
			Message string
		}{
			Message: "Org3User already exists",
		}

		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}
}
