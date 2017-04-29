/* @flow */

import React, { Component } from 'react';
import {
	View,
	Animated,
	StyleSheet,
	PanResponder,
	Dimensions,
	LayoutAnimation,
	UIManager
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.35 * width;

class Deck extends Component {
	constructor(props) {
		super(props);

		const position = new Animated.ValueXY();
		const panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (event, gesture) => {
				position.setValue({ x: gesture.dx });
			},
			onPanResponderRelease: (event, gesture) => {
				if (gesture.dx > SWIPE_THRESHOLD) {
					this._forceSwipe('right');
				} else if (gesture.dx < -SWIPE_THRESHOLD) {
					this._forceSwipe('left');
				} else {
					this._resetPosition();
				}
			}
		});

		this.state = {
			panResponder,
			position,
			index: 0
		};
	}

	componentWillUpdate() {
		// compatibility for android
		UIManager.setLayoutAnimationEnabledExperimental &&
			UIManager.setLayoutAnimationEnabledExperimental(true);
		const spring = {
			duration: 1500,
			create: {
				type: LayoutAnimation.Types.linear,
				property: LayoutAnimation.Properties.opacity
			},
			update: {
				type: LayoutAnimation.Types.spring,
				springDamping: 0.4
			},
			delete: {
				type: LayoutAnimation.Types.linear,
				property: LayoutAnimation.Properties.opacity
			}
		};

		LayoutAnimation.configureNext(spring);
	}

	_onSwipeComplete = direction => {
		const { onSwipeLeft, onSwipeRight, data } = this.props;
		const item = data[this.state.index];
		this.state.position.setValue({ x: 0, y: 0 });
		direction === 'left' ? onSwipeLeft(item) : onSwipeRight(item);
		this.setState({ index: this.state.index + 1 });
	};

	_forceSwipe = direction => {
		Animated.timing(this.state.position, {
			toValue: { x: direction === 'left' ? -0.9 * width : 0.9 * width, y: 0 },
			timing: 100
		}).start(() => this._onSwipeComplete(direction));
	};

	_resetPosition = () => {
		Animated.spring(this.state.position, {
			toValue: { x: 0, y: 0 }
		}).start();
	};

	_getCardStyle = () => {
		const { position } = this.state;
		const rotate = position.x.interpolate({
			inputRange: [-1.5 * width, 0, 1.5 * width],
			outputRange: ['-120deg', '0deg', '120deg']
		});
		const opacity = position.x.interpolate({
			inputRange: [-0.7 * width, 0, 0.7 * width],
			outputRange: [0, 1, 0]
		});
		return {
			...position.getLayout(),
			transform: [{ rotate }],
			opacity
		};
	};

	_renderCards = () => {
		if (this.state.index >= this.props.data.length) {
			return this.props.renderNoMoreCards();
		}

		return this.props.data
			.map((item, i) => {
				if (i < this.state.index) {
					return null;
				}
				if (i === this.state.index) {
					return (
						<Animated.View
							key={item.id}
							style={[this._getCardStyle(), styles.cardStyle]}
							{...this.state.panResponder.panHandlers}
						>
							{this.props.renderCard(item)}
						</Animated.View>
					);
				}

				return (
					<Animated.View
						key={item.id}
						style={[
							styles.cardStyle,
							{
								top: (i - this.state.index) * 30,
								transform: [{ scaleX: 1 - 0.1 * (i - this.state.index) }],
								opacity: 0.8
							}
						]}
					>
						{this.props.renderCard(item)}
					</Animated.View>
				);
			})
			.reverse();
	};

	render() {
		return (
			<View>
				{this._renderCards()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	cardStyle: {
		position: 'absolute',
		width: 0.9 * width
	}
});

Deck.defaultProps = {
	onSwipeLeft: item => {},
	onSwipeRight: item => {},
	renderNoMoreCards: () => null
};

export default Deck;
