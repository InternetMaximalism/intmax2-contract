// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library Bytes32QueueLib {
	error QueueIsEmpty();

	struct Queue {
		bytes32[] data;
		uint256 front;
		uint256 rear;
	}

	function initialize(Queue storage queue) internal {
		queue.front = 0;
		queue.rear = 0;
	}

	function enqueue(
		Queue storage queue,
		bytes32 value
	) internal returns (uint256 index) {
		queue.data.push(value);
		index = queue.rear;
		queue.rear++;
	}

	function dequeue(Queue storage queue) internal returns (bytes32) {
		if (isEmpty(queue)) {
			revert QueueIsEmpty();
		}
		bytes32 value = queue.data[queue.front];
		queue.front++;
		return value;
	}

	function isEmpty(Queue storage queue) internal view returns (bool) {
		return queue.front == queue.rear;
	}

	function size(Queue storage queue) internal view returns (uint256) {
		return queue.rear - queue.front;
	}

	function peek(Queue storage queue) internal view returns (bytes32) {
		if (isEmpty(queue)) {
			revert QueueIsEmpty();
		}
		return queue.data[queue.front];
	}
}
