// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IMambaswapV2Callee {
    function MambaswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}
