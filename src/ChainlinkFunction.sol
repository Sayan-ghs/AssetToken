// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// TODO: Re-enable Chainlink Functions integration when FunctionsClient is available
// Chainlink Functions is an off-chain integration layer and should not block protocol testing
// import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/interfaces/FunctionsClientInterface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

// TODO: Re-enable FunctionsClient inheritance when Chainlink Functions is integrated
contract ChainlinkFunction is /* FunctionsClient, */ ConfirmedOwner {
    // TODO: Re-enable when FunctionsClient is available
    // using Functions for Functions.Request;

    bytes32 public donId;
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    mapping(bytes32 => address) public requestToCaller;
    mapping(address => bytes32) public callerToRequest;

    error EmptyRequest();
    error OnlyRouterCanFulfill();
    error UnexpectedRequestID();
    error InvalidCallbackGasLimit();

    event RequestSent(bytes32 indexed requestId, address indexed caller);
    event ResponseReceived(bytes32 indexed requestId, bytes response);
    event ErrorReceived(bytes32 indexed requestId, bytes error);

    constructor(address router, bytes32 donId_)/* FunctionsClient(router) */  ConfirmedOwner(msg.sender) {
        // TODO: Re-enable router validation when FunctionsClient is integrated
        // require(router != address(0), "Invalid router");
        donId = donId_;
    }

    // TODO: Re-enable when Chainlink Functions is integrated
    function sendRequest(
        string memory source,
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 gasLimit
    ) external returns (bytes32 requestId) {
        // TODO: Re-enable full implementation when FunctionsClient is available
        revert("Chainlink Functions integration disabled - see TODO comments");

        /* Original implementation - to be restored:
        if (bytes(source).length == 0) {
            revert EmptyRequest();
        }

        Functions.Request memory req;
        req.initializeRequest(
            Functions.Location.Inline,
            Functions.CodeLanguage.JavaScript,
            source
        );

        if (encryptedSecretsUrls.length > 0) {
            req.addSecretsReference(encryptedSecretsUrls);
        } else {
            req.addDONHostedSecrets(
                donHostedSecretsSlotID,
                donHostedSecretsVersion
            );
        }

        if (args.length > 0) req.setArgs(args);
        if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);

        s_lastRequestId = _sendRequest(
            req.encode(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestToCaller[s_lastRequestId] = msg.sender;
        callerToRequest[msg.sender] = s_lastRequestId;

        emit RequestSent(s_lastRequestId, msg.sender);
        return s_lastRequestId;
        */
    }

    // TODO: Re-enable when Chainlink Functions is integrated
    // This function should override FunctionsClient.fulfillRequest when restored
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal /* override */  {
        // TODO: Re-enable full implementation when FunctionsClient is available
        if (requestToCaller[requestId] == address(0)) {
            revert UnexpectedRequestID();
        }

        s_lastResponse = response;
        s_lastError = err;

        address caller = requestToCaller[requestId];
        delete requestToCaller[requestId];
        delete callerToRequest[caller];

        if (err.length > 0) {
            emit ErrorReceived(requestId, err);
        } else {
            emit ResponseReceived(requestId, response);
        }
    }

    function updateDonId(bytes32 newDonId) external onlyOwner {
        donId = newDonId;
    }

    function getLastRequestId() external view returns (bytes32) {
        return s_lastRequestId;
    }

    function getLastResponse() external view returns (bytes memory) {
        return s_lastResponse;
    }

    function getLastError() external view returns (bytes memory) {
        return s_lastError;
    }
}

