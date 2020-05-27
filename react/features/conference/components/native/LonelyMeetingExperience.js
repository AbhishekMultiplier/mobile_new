// @flow

import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { getFeatureFlag, INVITE_ENABLED } from '../../../base/flags';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { getParticipantCount } from '../../../base/participants';
import { doInvitePeople } from '../../../invite/actions.native';

import styles from './styles';
import { Icon, IconAddPeople } from '../../../base/icons';
import { JitsiRecordingConstants } from '../../../base/lib-jitsi-meet';
import {
    PARTICIPANT_ROLE,
    getLocalParticipant
} from '../../../base/participants';
/**
 * Props type of the component.
 */
type Props = {

    /**
     * True if the invite functions (dial out, invite, share...etc) are disabled.
     */
    _isInviteFunctionsDiabled: boolean,

    /**
     * True if it's a lonely meeting (participant count excluding fakes is 1).
     */
    _isLonelyMeeting: boolean,

    /**
     * Color schemed styles of the component.
     */
    _styles: StyleType,

    /**
     * The Redux Dispatch function.
     */
    dispatch: Function,

    /**
     * Function to be used to translate i18n labels.
     */
    t: Function,
    isModerator: boolean,
    _conference: object,
    _participantCount: number
};

/**
 * Implements the UI elements to be displayed in the lonely meeting experience.
 */
class LonelyMeetingExperience extends Component<Props> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onPress = this._onPress.bind(this);
        this.state = {
            isStartRecording: false,
        }
    }
    componentDidUpdate(prevProps: *, prevState: State) {

        if (prevProps._participantCount === 1 && this.props._participantCount === 2) {

            if (this.props.isModerator && !this.state.isStartRecording) {
                console.log('recording')
                this.setState({ isStartRecording: true }, () => {
                    const appData = JSON.stringify({
                        'file_recording_metadata': {
                            'share': true
                        }
                    });

                    this.props._conference.startRecording({
                        mode: JitsiRecordingConstants.mode.FILE,
                        appData
                    });
                });

            }
        }

    }


    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { _isInviteFunctionsDiabled, _isLonelyMeeting, _styles, t } = this.props;

        if (!_isLonelyMeeting) {
            return null;
        }

        return (
            <View style={styles.lonelyMeetingContainer}>
                <Text
                    style={[
                        styles.lonelyMessage,
                        _styles.lonelyMessage
                    ]}>
                    {t('lonelyMeetingExperience.youAreAlone')}
                </Text>
                {!_isInviteFunctionsDiabled && (
                    <TouchableOpacity
                        onPress={this._onPress}
                        style={[
                            styles.lonelyButton,
                            _styles.lonelyButton
                        ]}>
                        <Icon
                            size={24}
                            src={IconAddPeople}
                            style={styles.lonelyButtonComponents} />
                        <Text
                            style={[
                                styles.lonelyButtonComponents,
                                _styles.lonelyMessage
                            ]}>
                            {t('lonelyMeetingExperience.button')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    _onPress: () => void;

    /**
     * Callback for the onPress function of the button.
     *
     * @returns {void}
     */
    _onPress() {
        this.props.dispatch(doInvitePeople());
    }
}

/**
 * Maps parts of the Redux state to the props of this Component.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state): $Shape<Props> {
    const { disableInviteFunctions } = state['features/base/config'];
    const flag = getFeatureFlag(state, INVITE_ENABLED, true);
    const _participantCount = getParticipantCount(state);
    const isModerator
        = getLocalParticipant(state).role === PARTICIPANT_ROLE.MODERATOR;
    return {
        _isInviteFunctionsDiabled: !flag || disableInviteFunctions,
        _isLonelyMeeting: _participantCount === 1,
        isModerator,
        _participantCount,
        _styles: ColorSchemeRegistry.get(state, 'Conference'),
        _conference: state['features/base/conference'].conference
    };
}

export default connect(_mapStateToProps)(translate(LonelyMeetingExperience));
