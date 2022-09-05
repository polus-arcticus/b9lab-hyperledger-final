package main

import (
	"encoding/json"
	_ "fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createOwner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	var owner Owner
	err := json.Unmarshal([]byte(args[0]), &owner)
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerKey, err := stub.CreateCompositeKey(prefixOwner, []string{owner.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerAsBytes, _ := stub.GetState(ownerKey)

	if len(ownerAsBytes) == 0 {
		ownerAsBytes, err := json.Marshal(owner)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(ownerKey, ownerAsBytes)
		responseAsBytes, err := json.Marshal(Response{"Registered!"})
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	responseAsBytes, err := json.Marshal(Response{"User already Exists"})
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseAsBytes)
}
