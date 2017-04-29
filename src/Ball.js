/* @flow */

import React, { Component } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default class Ball extends Component {
	componentWillMount() {
		this.position = new Animated.ValueXY(0, 0);
		this._isDown = false;
	}

	componentDidMount() {
		this._animateBall();
	}

	_animateBall = () => {
		Animated.spring(this.position, {
			toValue: {
				x: 0.7 * width,
				y: this._isDown ? 0.7 * height : 0.8 * height
			},
      // tension: 70,
			// friction: 3
		}).start(() => {
      this._isDown = !this._isDown;
			// setTimeout(() => this._animateBall(), 1000);
      this._animateBall();
		});
	};

	render() {
		return (
			<Animated.View style={this.position.getLayout()}>
				<View style={styles.ball} />
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
	ball: {
		width: 60,
		height: 60,
		backgroundColor: '#000',
		borderRadius: 30
	}
});
