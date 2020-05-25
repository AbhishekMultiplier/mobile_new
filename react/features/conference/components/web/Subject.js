/* @flow */

import React, { Component } from 'react';

import { getConferenceName } from '../../../base/conference/functions';
import { getParticipantCount } from '../../../base/participants/functions';
import { connect } from '../../../base/redux';
import { isToolboxVisible } from '../../../toolbox';
import { JitsiRecordingConstants } from '../../../base/lib-jitsi-meet';

import ConferenceTimer from '../ConferenceTimer';
import ParticipantsCount from './ParticipantsCount';
import {
    PARTICIPANT_ROLE,
    getLocalParticipant
} from '../../../base/participants';

/**
 * The type of the React {@code Component} props of {@link Subject}.
 */
type Props = {

    /**
     * Whether then participant count should be shown or not.
     */
    _showParticipantCount: boolean,

    /**
     * The subject or the of the conference.
     * Falls back to conference name.
     */
    _subject: string,

    /**
     * Indicates whether the component should be visible or not.
     */
    _visible: boolean,
    isModerator: boolean,
    _conference: object,
    participantCount: number
};

/**
 * Subject react component.
 *
 * @class Subject
 */
class Subject extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            isStartRecording: false,
        }
    }
    componentDidUpdate(prevProps: *, prevState: State) {
        if (prevProps.participantCount === 1 && this.props.participantCount === 2) {
            if (this.props.isModerator && !this.state.isStartRecording) {
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
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _showParticipantCount, _subject, _visible, isModerator, participantCount } = this.props;

        return (
            <div className={`subject ${_visible ? 'visible' : ''}`}>
                <span className='subject-text'>{_subject}</span>
                {_showParticipantCount && <ParticipantsCount />}
                <ConferenceTimer />
            </div>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated
 * {@code Subject}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _subject: string,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const participantCount = getParticipantCount(state);
    const isModerator
        = getLocalParticipant(state).role === PARTICIPANT_ROLE.MODERATOR;
    return {
        _showParticipantCount: participantCount > 2,
        participantCount,
        _subject: getConferenceName(state),
        _visible: isToolboxVisible(state),
        isModerator,
        _conference: state['features/base/conference'].conference

    };
}

export default connect(_mapStateToProps)(Subject);
