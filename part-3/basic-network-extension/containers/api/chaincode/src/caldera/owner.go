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
	input := struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Password string `json:"password"`
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerKey, err := stub.CreateCompositeKey(prefixOwner, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerAsBytes, _ := stub.GetState(ownerKey)

	if len(ownerAsBytes) == 0 {
		var collection = []string{}
		owner := Owner{input.Name, input.Username, input.Password, collection}
		ownerAsBytes, err = json.Marshal(owner)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(ownerKey, ownerAsBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
		responseAsBytes, err := json.Marshal(Response{"Registered" + owner.Username})
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
