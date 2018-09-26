package main

import (
	_ "fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"testing"
)

func TestCreateArtist(t *testing.T) {
	scc := new(SmartContract)
	stub := shim.NewMockStub("caldera", scc)

	checkInvoke(t, stub, [][]byte{[]byte("create_artist"), []byte("{\"name\":\"Joe\", \"username\":\"Joe-mcgee\", \"password\":\"password\"}")})
	checkState(t, stub, "Joe-mcgee", "{}")
}
