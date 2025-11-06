export class Utils {
    static getContentData() {
        const contentTypes = [
            { label: 'HTML Page', value: 'html' },
            { label: 'Video', value: 'video' },
            { label: 'PDF Document', value: 'pdf' },
            { label: 'SCORM Package', value: 'scorm' },
            { label: 'External Link', value: 'externallink' }
        ];
        return contentTypes;
    }

    static getDuration() {
        const durations = [
            'None',
            '5 minutes',
            '10 minutes',
            '15 minutes',
            '30 minutes',
            '45 minutes',
            '1 hour',
            '2 hours',
            'Custom'
        ];
        return durations;
    }

    static convertDurationToText(duration: string): string {
        const parts = duration.split(':');
        if (parts.length !== 3) return '';

        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);

        let result = '';
        if (hours > 0) {
            result += `${hours} Hours `;
        }
        if (minutes > 0) {
            result += `${minutes} Min `;
        }
        if (seconds > 0) {
            result += `${seconds} Sec`;
        }

        return result.trim();
    }

}