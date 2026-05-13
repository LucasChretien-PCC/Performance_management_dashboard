// Mock data for the dashboard

export type TimePeriod = 'day' | 'week' | 'month' | 'all-time';

export interface Advisor {
  id: string;
  name: string;
  team: string;
  callType: 'redemption' | 'appointment';
  weeklyHours: number; // Scheduled working hours per week (20-40)
  avatar?: string;
  metrics: AdvisorMetrics;
  metricsByPeriod: {
    day: AdvisorMetrics;
    week: AdvisorMetrics;
    month: AdvisorMetrics;
    'all-time': AdvisorMetrics;
  };
}

export interface AdvisorMetrics {
  // Operational Metrics
  callsPerHour: number; // Average calls handled per hour
  averageHandleTime: number; // Average handle time in minutes
  afterCallWorkTime: number; // After call work time in minutes

  // Content of Calls
  informationAccuracy: number; // 0-100 score
  securityCompliance: number; // 0-100 score

  // Quality Score
  callTimeEfficiency: number; // 0-100 score
  conversationalBalance: number; // 0-100 score
  clientConcernsCovered: number; // % 50-100
  followUpClarity: number; // 0-100 score

  // Experience Score
  callSentimentPositive: number; // % of calls
  callSentimentNeutral: number;  // % of calls
  callSentimentNegative: number; // % of calls (sums to 100 with above)

  // Opportunities
  opportunitiesIdentified: number;
  opportunitiesActioned: number;

  // Overall
  overallScore: number; // weighted average 0-100
  performanceTrend: 'up' | 'down' | 'stable';

  // Call Metrics
  pctDayOnCalls: number; // % of working day actively on calls (0-100)
  // pctDayOffCalls = 100 - pctDayOnCalls (derived in UI)
  // Call handle time breakdown in minutes — must sum to averageHandleTime
  introTime: number;
  authenticationTime: number;
  kycTime: number;
  redemptionDetailsTime: number;
  confirmationsDisclosuresTime: number;
  outroTime: number;
}

// Helper function to get metrics for a specific time period
export const getAdvisorMetrics = (advisor: Advisor, timePeriod: TimePeriod): AdvisorMetrics => {
  return advisor.metricsByPeriod[timePeriod];
};

export const mockAdvisors: Advisor[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    team: 'Redemptions',
    callType: 'redemption',
    weeklyHours: 35,
    metrics: {
      // Month metrics (default)
      callsPerHour: 5.5,
      averageHandleTime: 11.2,
      afterCallWorkTime: 4.8,
      informationAccuracy: 97,
      securityCompliance: 99,
      callTimeEfficiency: 91,
      conversationalBalance: 78,
      clientConcernsCovered: 88,
      followUpClarity: 93,
      callSentimentPositive: 65,
      callSentimentNeutral: 25,
      callSentimentNegative: 10,
      opportunitiesIdentified: 42,
      opportunitiesActioned: 29,
      overallScore: 90,
      performanceTrend: 'up',
      pctDayOnCalls: 72,
      introTime: 0.7,
      authenticationTime: 1.8,
      kycTime: 2.2,
      redemptionDetailsTime: 3.4,
      confirmationsDisclosuresTime: 2.2,
      outroTime: 0.9,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 5.3,
        averageHandleTime: 11.0,
        afterCallWorkTime: 4.6,
        informationAccuracy: 98,
        securityCompliance: 99,
        callTimeEfficiency: 92,
        conversationalBalance: 76,
        clientConcernsCovered: 87,
        followUpClarity: 94,
        callSentimentPositive: 64,
        callSentimentNeutral: 25,
        callSentimentNegative: 11,
        opportunitiesIdentified: 2,
        opportunitiesActioned: 1,
        overallScore: 91,
        performanceTrend: 'up',
        pctDayOnCalls: 71,
        introTime: 0.7,
        authenticationTime: 1.7,
        kycTime: 2.1,
        redemptionDetailsTime: 3.3,
        confirmationsDisclosuresTime: 2.3,
        outroTime: 0.9,
      },
      week: {
        callsPerHour: 5.6,
        averageHandleTime: 11.3,
        afterCallWorkTime: 4.9,
        informationAccuracy: 97,
        securityCompliance: 99,
        callTimeEfficiency: 91,
        conversationalBalance: 77,
        clientConcernsCovered: 89,
        followUpClarity: 93,
        callSentimentPositive: 66,
        callSentimentNeutral: 24,
        callSentimentNegative: 10,
        opportunitiesIdentified: 14,
        opportunitiesActioned: 10,
        overallScore: 90,
        performanceTrend: 'up',
        pctDayOnCalls: 73,
        introTime: 0.7,
        authenticationTime: 1.8,
        kycTime: 2.2,
        redemptionDetailsTime: 3.5,
        confirmationsDisclosuresTime: 2.2,
        outroTime: 0.9,
      },
      month: {
        callsPerHour: 5.5,
        averageHandleTime: 11.2,
        afterCallWorkTime: 4.8,
        informationAccuracy: 97,
        securityCompliance: 99,
        callTimeEfficiency: 91,
        conversationalBalance: 78,
        clientConcernsCovered: 88,
        followUpClarity: 93,
        callSentimentPositive: 65,
        callSentimentNeutral: 25,
        callSentimentNegative: 10,
        opportunitiesIdentified: 42,
        opportunitiesActioned: 29,
        overallScore: 90,
        performanceTrend: 'up',
        pctDayOnCalls: 72,
        introTime: 0.7,
        authenticationTime: 1.8,
        kycTime: 2.2,
        redemptionDetailsTime: 3.4,
        confirmationsDisclosuresTime: 2.2,
        outroTime: 0.9,
      },
      'all-time': {
        callsPerHour: 5.4,
        averageHandleTime: 11.4,
        afterCallWorkTime: 5.0,
        informationAccuracy: 96,
        securityCompliance: 98,
        callTimeEfficiency: 90,
        conversationalBalance: 79,
        clientConcernsCovered: 87,
        followUpClarity: 92,
        callSentimentPositive: 64,
        callSentimentNeutral: 26,
        callSentimentNegative: 10,
        opportunitiesIdentified: 512,
        opportunitiesActioned: 348,
        overallScore: 89,
        performanceTrend: 'up',
        pctDayOnCalls: 71,
        introTime: 0.7,
        authenticationTime: 1.9,
        kycTime: 2.2,
        redemptionDetailsTime: 3.4,
        confirmationsDisclosuresTime: 2.3,
        outroTime: 0.9,
      }
    }
  },
  {
    id: '2',
    name: 'James Rodriguez',
    team: 'Redemptions',
    callType: 'redemption',
    weeklyHours: 24,
    metrics: {
      callsPerHour: 3.2,
      averageHandleTime: 16.8,
      afterCallWorkTime: 8.2,
      informationAccuracy: 84,
      securityCompliance: 88,
      callTimeEfficiency: 68,
      conversationalBalance: 91,
      clientConcernsCovered: 65,
      followUpClarity: 82,
      callSentimentPositive: 52,
      callSentimentNeutral: 31,
      callSentimentNegative: 17,
      opportunitiesIdentified: 15,
      opportunitiesActioned: 8,
      overallScore: 78,
      performanceTrend: 'stable',
      pctDayOnCalls: 58,
      introTime: 1.1,
      authenticationTime: 2.7,
      kycTime: 3.5,
      redemptionDetailsTime: 5.2,
      confirmationsDisclosuresTime: 3.5,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 3.0,
        averageHandleTime: 16.5,
        afterCallWorkTime: 8.0,
        informationAccuracy: 85,
        securityCompliance: 89,
        callTimeEfficiency: 69,
        conversationalBalance: 92,
        clientConcernsCovered: 64,
        followUpClarity: 83,
        callSentimentPositive: 51,
        callSentimentNeutral: 31,
        callSentimentNegative: 18,
        opportunitiesIdentified: 1,
        opportunitiesActioned: 0,
        overallScore: 79,
        performanceTrend: 'stable',
        pctDayOnCalls: 57,
        introTime: 1.1,
        authenticationTime: 2.7,
        kycTime: 3.4,
        redemptionDetailsTime: 5.0,
        confirmationsDisclosuresTime: 3.5,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 3.1,
        averageHandleTime: 16.6,
        afterCallWorkTime: 8.1,
        informationAccuracy: 84,
        securityCompliance: 88,
        callTimeEfficiency: 68,
        conversationalBalance: 91,
        clientConcernsCovered: 65,
        followUpClarity: 82,
        callSentimentPositive: 53,
        callSentimentNeutral: 30,
        callSentimentNegative: 17,
        opportunitiesIdentified: 5,
        opportunitiesActioned: 3,
        overallScore: 78,
        performanceTrend: 'stable',
        pctDayOnCalls: 59,
        introTime: 1.1,
        authenticationTime: 2.7,
        kycTime: 3.4,
        redemptionDetailsTime: 5.1,
        confirmationsDisclosuresTime: 3.5,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 3.2,
        averageHandleTime: 16.8,
        afterCallWorkTime: 8.2,
        informationAccuracy: 84,
        securityCompliance: 88,
        callTimeEfficiency: 68,
        conversationalBalance: 91,
        clientConcernsCovered: 65,
        followUpClarity: 82,
        callSentimentPositive: 52,
        callSentimentNeutral: 31,
        callSentimentNegative: 17,
        opportunitiesIdentified: 15,
        opportunitiesActioned: 8,
        overallScore: 78,
        performanceTrend: 'stable',
        pctDayOnCalls: 58,
        introTime: 1.1,
        authenticationTime: 2.7,
        kycTime: 3.5,
        redemptionDetailsTime: 5.2,
        confirmationsDisclosuresTime: 3.5,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 3.3,
        averageHandleTime: 17.1,
        afterCallWorkTime: 8.4,
        informationAccuracy: 83,
        securityCompliance: 87,
        callTimeEfficiency: 67,
        conversationalBalance: 90,
        clientConcernsCovered: 63,
        followUpClarity: 81,
        callSentimentPositive: 51,
        callSentimentNeutral: 32,
        callSentimentNegative: 17,
        opportunitiesIdentified: 185,
        opportunitiesActioned: 98,
        overallScore: 77,
        performanceTrend: 'stable',
        pctDayOnCalls: 57,
        introTime: 1.1,
        authenticationTime: 2.8,
        kycTime: 3.6,
        redemptionDetailsTime: 5.3,
        confirmationsDisclosuresTime: 3.5,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '3',
    name: 'Emily Chen',
    team: 'Client Appointments',
    callType: 'appointment',
    weeklyHours: 40,
    metrics: {
      callsPerHour: 7.4,
      averageHandleTime: 12.4,
      afterCallWorkTime: 5.1,
      informationAccuracy: 98,
      securityCompliance: 99,
      callTimeEfficiency: 96,
      conversationalBalance: 95,
      clientConcernsCovered: 96,
      followUpClarity: 98,
      callSentimentPositive: 72,
      callSentimentNeutral: 20,
      callSentimentNegative: 8,
      opportunitiesIdentified: 58,
      opportunitiesActioned: 53,
      overallScore: 96,
      performanceTrend: 'up',
      pctDayOnCalls: 82,
      introTime: 0.8,
      authenticationTime: 1.9,
      kycTime: 2.5,
      redemptionDetailsTime: 3.8,
      confirmationsDisclosuresTime: 2.6,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 7.2,
        averageHandleTime: 12.2,
        afterCallWorkTime: 4.9,
        informationAccuracy: 99,
        securityCompliance: 100,
        callTimeEfficiency: 97,
        conversationalBalance: 96,
        clientConcernsCovered: 97,
        followUpClarity: 99,
        callSentimentPositive: 73,
        callSentimentNeutral: 20,
        callSentimentNegative: 7,
        opportunitiesIdentified: 3,
        opportunitiesActioned: 3,
        overallScore: 97,
        performanceTrend: 'up',
        pctDayOnCalls: 80,
        introTime: 0.8,
        authenticationTime: 1.9,
        kycTime: 2.4,
        redemptionDetailsTime: 3.7,
        confirmationsDisclosuresTime: 2.6,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 7.5,
        averageHandleTime: 12.3,
        afterCallWorkTime: 5.0,
        informationAccuracy: 98,
        securityCompliance: 99,
        callTimeEfficiency: 96,
        conversationalBalance: 95,
        clientConcernsCovered: 96,
        followUpClarity: 98,
        callSentimentPositive: 72,
        callSentimentNeutral: 20,
        callSentimentNegative: 8,
        opportunitiesIdentified: 19,
        opportunitiesActioned: 17,
        overallScore: 96,
        performanceTrend: 'up',
        pctDayOnCalls: 83,
        introTime: 0.8,
        authenticationTime: 1.9,
        kycTime: 2.5,
        redemptionDetailsTime: 3.7,
        confirmationsDisclosuresTime: 2.6,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 7.4,
        averageHandleTime: 12.4,
        afterCallWorkTime: 5.1,
        informationAccuracy: 98,
        securityCompliance: 99,
        callTimeEfficiency: 96,
        conversationalBalance: 95,
        clientConcernsCovered: 96,
        followUpClarity: 98,
        callSentimentPositive: 72,
        callSentimentNeutral: 20,
        callSentimentNegative: 8,
        opportunitiesIdentified: 58,
        opportunitiesActioned: 53,
        overallScore: 96,
        performanceTrend: 'up',
        pctDayOnCalls: 82,
        introTime: 0.8,
        authenticationTime: 1.9,
        kycTime: 2.5,
        redemptionDetailsTime: 3.8,
        confirmationsDisclosuresTime: 2.6,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 7.3,
        averageHandleTime: 12.5,
        afterCallWorkTime: 5.2,
        informationAccuracy: 97,
        securityCompliance: 99,
        callTimeEfficiency: 95,
        conversationalBalance: 94,
        clientConcernsCovered: 95,
        followUpClarity: 97,
        callSentimentPositive: 71,
        callSentimentNeutral: 21,
        callSentimentNegative: 8,
        opportunitiesIdentified: 712,
        opportunitiesActioned: 648,
        overallScore: 95,
        performanceTrend: 'up',
        pctDayOnCalls: 81,
        introTime: 0.8,
        authenticationTime: 1.9,
        kycTime: 2.5,
        redemptionDetailsTime: 3.9,
        confirmationsDisclosuresTime: 2.6,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '4',
    name: 'Michael Thompson',
    team: 'Redemptions',
    callType: 'redemption',
    weeklyHours: 28,
    metrics: {
      callsPerHour: 4.3,
      averageHandleTime: 15.9,
      afterCallWorkTime: 7.8,
      informationAccuracy: 71,
      securityCompliance: 68,
      callTimeEfficiency: 65,
      conversationalBalance: 73,
      clientConcernsCovered: 58,
      followUpClarity: 77,
      callSentimentPositive: 48,
      callSentimentNeutral: 33,
      callSentimentNegative: 19,
      opportunitiesIdentified: 12,
      opportunitiesActioned: 5,
      overallScore: 70,
      performanceTrend: 'down',
      pctDayOnCalls: 64,
      introTime: 1.1,
      authenticationTime: 2.5,
      kycTime: 3.2,
      redemptionDetailsTime: 4.9,
      confirmationsDisclosuresTime: 3.4,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 4.1,
        averageHandleTime: 15.5,
        afterCallWorkTime: 7.5,
        informationAccuracy: 73,
        securityCompliance: 70,
        callTimeEfficiency: 67,
        conversationalBalance: 75,
        clientConcernsCovered: 58,
        followUpClarity: 78,
        callSentimentPositive: 47,
        callSentimentNeutral: 33,
        callSentimentNegative: 20,
        opportunitiesIdentified: 1,
        opportunitiesActioned: 0,
        overallScore: 72,
        performanceTrend: 'down',
        pctDayOnCalls: 63,
        introTime: 1.0,
        authenticationTime: 2.5,
        kycTime: 3.1,
        redemptionDetailsTime: 4.7,
        confirmationsDisclosuresTime: 3.4,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 4.4,
        averageHandleTime: 15.7,
        afterCallWorkTime: 7.7,
        informationAccuracy: 72,
        securityCompliance: 69,
        callTimeEfficiency: 66,
        conversationalBalance: 74,
        clientConcernsCovered: 59,
        followUpClarity: 77,
        callSentimentPositive: 49,
        callSentimentNeutral: 33,
        callSentimentNegative: 18,
        opportunitiesIdentified: 4,
        opportunitiesActioned: 2,
        overallScore: 71,
        performanceTrend: 'down',
        pctDayOnCalls: 65,
        introTime: 1.1,
        authenticationTime: 2.5,
        kycTime: 3.1,
        redemptionDetailsTime: 4.8,
        confirmationsDisclosuresTime: 3.4,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 4.3,
        averageHandleTime: 15.9,
        afterCallWorkTime: 7.8,
        informationAccuracy: 71,
        securityCompliance: 68,
        callTimeEfficiency: 65,
        conversationalBalance: 73,
        clientConcernsCovered: 57,
        followUpClarity: 77,
        callSentimentPositive: 48,
        callSentimentNeutral: 33,
        callSentimentNegative: 19,
        opportunitiesIdentified: 12,
        opportunitiesActioned: 5,
        overallScore: 70,
        performanceTrend: 'down',
        pctDayOnCalls: 64,
        introTime: 1.1,
        authenticationTime: 2.5,
        kycTime: 3.2,
        redemptionDetailsTime: 4.9,
        confirmationsDisclosuresTime: 3.4,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 4.2,
        averageHandleTime: 16.2,
        afterCallWorkTime: 8.1,
        informationAccuracy: 70,
        securityCompliance: 67,
        callTimeEfficiency: 64,
        conversationalBalance: 72,
        clientConcernsCovered: 56,
        followUpClarity: 76,
        callSentimentPositive: 47,
        callSentimentNeutral: 34,
        callSentimentNegative: 19,
        opportunitiesIdentified: 148,
        opportunitiesActioned: 61,
        overallScore: 69,
        performanceTrend: 'down',
        pctDayOnCalls: 63,
        introTime: 1.1,
        authenticationTime: 2.6,
        kycTime: 3.3,
        redemptionDetailsTime: 5.0,
        confirmationsDisclosuresTime: 3.4,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '5',
    name: 'Amanda Foster',
    team: 'Client Appointments',
    callType: 'appointment',
    weeklyHours: 32,
    metrics: {
      callsPerHour: 6.8,
      averageHandleTime: 13.1,
      afterCallWorkTime: 5.9,
      informationAccuracy: 95,
      securityCompliance: 97,
      callTimeEfficiency: 94,
      conversationalBalance: 88,
      clientConcernsCovered: 82,
      followUpClarity: 96,
      callSentimentPositive: 68,
      callSentimentNeutral: 23,
      callSentimentNegative: 9,
      opportunitiesIdentified: 56,
      opportunitiesActioned: 38,
      overallScore: 89,
      performanceTrend: 'up',
      pctDayOnCalls: 78,
      introTime: 0.9,
      authenticationTime: 2.0,
      kycTime: 2.6,
      redemptionDetailsTime: 4.1,
      confirmationsDisclosuresTime: 2.7,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 6.6,
        averageHandleTime: 12.9,
        afterCallWorkTime: 5.7,
        informationAccuracy: 96,
        securityCompliance: 98,
        callTimeEfficiency: 95,
        conversationalBalance: 89,
        clientConcernsCovered: 82,
        followUpClarity: 97,
        callSentimentPositive: 69,
        callSentimentNeutral: 23,
        callSentimentNegative: 8,
        opportunitiesIdentified: 3,
        opportunitiesActioned: 2,
        overallScore: 90,
        performanceTrend: 'up',
        pctDayOnCalls: 77,
        introTime: 0.9,
        authenticationTime: 2.0,
        kycTime: 2.5,
        redemptionDetailsTime: 4.0,
        confirmationsDisclosuresTime: 2.7,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 6.9,
        averageHandleTime: 13.0,
        afterCallWorkTime: 5.8,
        informationAccuracy: 95,
        securityCompliance: 97,
        callTimeEfficiency: 94,
        conversationalBalance: 88,
        clientConcernsCovered: 83,
        followUpClarity: 96,
        callSentimentPositive: 68,
        callSentimentNeutral: 23,
        callSentimentNegative: 9,
        opportunitiesIdentified: 18,
        opportunitiesActioned: 12,
        overallScore: 89,
        performanceTrend: 'up',
        pctDayOnCalls: 79,
        introTime: 0.9,
        authenticationTime: 2.0,
        kycTime: 2.5,
        redemptionDetailsTime: 4.1,
        confirmationsDisclosuresTime: 2.7,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 6.8,
        averageHandleTime: 13.1,
        afterCallWorkTime: 5.9,
        informationAccuracy: 95,
        securityCompliance: 97,
        callTimeEfficiency: 94,
        conversationalBalance: 88,
        clientConcernsCovered: 82,
        followUpClarity: 96,
        callSentimentPositive: 68,
        callSentimentNeutral: 23,
        callSentimentNegative: 9,
        opportunitiesIdentified: 56,
        opportunitiesActioned: 38,
        overallScore: 89,
        performanceTrend: 'up',
        pctDayOnCalls: 78,
        introTime: 0.9,
        authenticationTime: 2.0,
        kycTime: 2.6,
        redemptionDetailsTime: 4.1,
        confirmationsDisclosuresTime: 2.7,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 6.7,
        averageHandleTime: 13.3,
        afterCallWorkTime: 6.1,
        informationAccuracy: 94,
        securityCompliance: 96,
        callTimeEfficiency: 93,
        conversationalBalance: 87,
        clientConcernsCovered: 80,
        followUpClarity: 95,
        callSentimentPositive: 67,
        callSentimentNeutral: 24,
        callSentimentNegative: 9,
        opportunitiesIdentified: 688,
        opportunitiesActioned: 468,
        overallScore: 88,
        performanceTrend: 'up',
        pctDayOnCalls: 77,
        introTime: 0.9,
        authenticationTime: 2.0,
        kycTime: 2.7,
        redemptionDetailsTime: 4.2,
        confirmationsDisclosuresTime: 2.7,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '6',
    name: 'David Park',
    team: 'Redemptions',
    callType: 'redemption',
    weeklyHours: 38,
    metrics: {
      callsPerHour: 4.9,
      averageHandleTime: 13.6,
      afterCallWorkTime: 6.4,
      informationAccuracy: 86,
      securityCompliance: 91,
      callTimeEfficiency: 82,
      conversationalBalance: 85,
      clientConcernsCovered: 74,
      followUpClarity: 87,
      callSentimentPositive: 58,
      callSentimentNeutral: 28,
      callSentimentNegative: 14,
      opportunitiesIdentified: 28,
      opportunitiesActioned: 21,
      overallScore: 84,
      performanceTrend: 'stable',
      pctDayOnCalls: 68,
      introTime: 0.9,
      authenticationTime: 2.1,
      kycTime: 2.7,
      redemptionDetailsTime: 4.3,
      confirmationsDisclosuresTime: 2.8,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 4.7,
        averageHandleTime: 13.4,
        afterCallWorkTime: 6.2,
        informationAccuracy: 87,
        securityCompliance: 92,
        callTimeEfficiency: 83,
        conversationalBalance: 86,
        clientConcernsCovered: 75,
        followUpClarity: 88,
        callSentimentPositive: 57,
        callSentimentNeutral: 28,
        callSentimentNegative: 15,
        opportunitiesIdentified: 1,
        opportunitiesActioned: 1,
        overallScore: 85,
        performanceTrend: 'stable',
        pctDayOnCalls: 67,
        introTime: 0.9,
        authenticationTime: 2.1,
        kycTime: 2.6,
        redemptionDetailsTime: 4.2,
        confirmationsDisclosuresTime: 2.8,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 5.0,
        averageHandleTime: 13.5,
        afterCallWorkTime: 6.3,
        informationAccuracy: 86,
        securityCompliance: 91,
        callTimeEfficiency: 82,
        conversationalBalance: 85,
        clientConcernsCovered: 74,
        followUpClarity: 87,
        callSentimentPositive: 59,
        callSentimentNeutral: 27,
        callSentimentNegative: 14,
        opportunitiesIdentified: 9,
        opportunitiesActioned: 7,
        overallScore: 84,
        performanceTrend: 'stable',
        pctDayOnCalls: 69,
        introTime: 0.9,
        authenticationTime: 2.1,
        kycTime: 2.7,
        redemptionDetailsTime: 4.2,
        confirmationsDisclosuresTime: 2.8,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 4.9,
        averageHandleTime: 13.6,
        afterCallWorkTime: 6.4,
        informationAccuracy: 86,
        securityCompliance: 91,
        callTimeEfficiency: 82,
        conversationalBalance: 85,
        clientConcernsCovered: 73,
        followUpClarity: 87,
        callSentimentPositive: 58,
        callSentimentNeutral: 28,
        callSentimentNegative: 14,
        opportunitiesIdentified: 28,
        opportunitiesActioned: 21,
        overallScore: 84,
        performanceTrend: 'stable',
        pctDayOnCalls: 68,
        introTime: 0.9,
        authenticationTime: 2.1,
        kycTime: 2.7,
        redemptionDetailsTime: 4.3,
        confirmationsDisclosuresTime: 2.8,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 4.8,
        averageHandleTime: 13.8,
        afterCallWorkTime: 6.6,
        informationAccuracy: 85,
        securityCompliance: 90,
        callTimeEfficiency: 81,
        conversationalBalance: 84,
        clientConcernsCovered: 72,
        followUpClarity: 86,
        callSentimentPositive: 57,
        callSentimentNeutral: 29,
        callSentimentNegative: 14,
        opportunitiesIdentified: 344,
        opportunitiesActioned: 258,
        overallScore: 83,
        performanceTrend: 'stable',
        pctDayOnCalls: 67,
        introTime: 0.9,
        authenticationTime: 2.2,
        kycTime: 2.7,
        redemptionDetailsTime: 4.4,
        confirmationsDisclosuresTime: 2.8,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '7',
    name: 'Jessica Martinez',
    team: 'Client Appointments',
    callType: 'appointment',
    weeklyHours: 22,
    metrics: {
      callsPerHour: 6.2,
      averageHandleTime: 14.2,
      afterCallWorkTime: 6.7,
      informationAccuracy: 88,
      securityCompliance: 92,
      callTimeEfficiency: 86,
      conversationalBalance: 94,
      clientConcernsCovered: 85,
      followUpClarity: 89,
      callSentimentPositive: 70,
      callSentimentNeutral: 22,
      callSentimentNegative: 8,
      opportunitiesIdentified: 34,
      opportunitiesActioned: 29,
      overallScore: 88,
      performanceTrend: 'up',
      pctDayOnCalls: 74,
      introTime: 1.0,
      authenticationTime: 2.2,
      kycTime: 2.8,
      redemptionDetailsTime: 4.5,
      confirmationsDisclosuresTime: 2.9,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 6.0,
        averageHandleTime: 14.0,
        afterCallWorkTime: 6.5,
        informationAccuracy: 89,
        securityCompliance: 93,
        callTimeEfficiency: 87,
        conversationalBalance: 95,
        clientConcernsCovered: 86,
        followUpClarity: 90,
        callSentimentPositive: 71,
        callSentimentNeutral: 21,
        callSentimentNegative: 8,
        opportunitiesIdentified: 2,
        opportunitiesActioned: 2,
        overallScore: 89,
        performanceTrend: 'up',
        pctDayOnCalls: 73,
        introTime: 1.0,
        authenticationTime: 2.2,
        kycTime: 2.7,
        redemptionDetailsTime: 4.4,
        confirmationsDisclosuresTime: 2.9,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 6.3,
        averageHandleTime: 14.1,
        afterCallWorkTime: 6.6,
        informationAccuracy: 88,
        securityCompliance: 92,
        callTimeEfficiency: 86,
        conversationalBalance: 94,
        clientConcernsCovered: 85,
        followUpClarity: 89,
        callSentimentPositive: 70,
        callSentimentNeutral: 22,
        callSentimentNegative: 8,
        opportunitiesIdentified: 11,
        opportunitiesActioned: 9,
        overallScore: 88,
        performanceTrend: 'up',
        pctDayOnCalls: 75,
        introTime: 1.0,
        authenticationTime: 2.2,
        kycTime: 2.7,
        redemptionDetailsTime: 4.5,
        confirmationsDisclosuresTime: 2.9,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 6.2,
        averageHandleTime: 14.2,
        afterCallWorkTime: 6.7,
        informationAccuracy: 88,
        securityCompliance: 92,
        callTimeEfficiency: 86,
        conversationalBalance: 94,
        clientConcernsCovered: 84,
        followUpClarity: 89,
        callSentimentPositive: 70,
        callSentimentNeutral: 22,
        callSentimentNegative: 8,
        opportunitiesIdentified: 34,
        opportunitiesActioned: 29,
        overallScore: 88,
        performanceTrend: 'up',
        pctDayOnCalls: 74,
        introTime: 1.0,
        authenticationTime: 2.2,
        kycTime: 2.8,
        redemptionDetailsTime: 4.5,
        confirmationsDisclosuresTime: 2.9,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 6.1,
        averageHandleTime: 14.4,
        afterCallWorkTime: 6.9,
        informationAccuracy: 87,
        securityCompliance: 91,
        callTimeEfficiency: 85,
        conversationalBalance: 93,
        clientConcernsCovered: 84,
        followUpClarity: 88,
        callSentimentPositive: 69,
        callSentimentNeutral: 23,
        callSentimentNegative: 8,
        opportunitiesIdentified: 418,
        opportunitiesActioned: 355,
        overallScore: 87,
        performanceTrend: 'up',
        pctDayOnCalls: 73,
        introTime: 1.0,
        authenticationTime: 2.2,
        kycTime: 2.8,
        redemptionDetailsTime: 4.6,
        confirmationsDisclosuresTime: 3.0,
        outroTime: 0.8,
      }
    }
  },
  {
    id: '8',
    name: 'Robert Wilson',
    team: 'Redemptions',
    callType: 'redemption',
    weeklyHours: 20,
    metrics: {
      callsPerHour: 3.7,
      averageHandleTime: 14.7,
      afterCallWorkTime: 7.5,
      informationAccuracy: 79,
      securityCompliance: 83,
      callTimeEfficiency: 72,
      conversationalBalance: 69,
      clientConcernsCovered: 62,
      followUpClarity: 74,
      callSentimentPositive: 54,
      callSentimentNeutral: 29,
      callSentimentNegative: 17,
      opportunitiesIdentified: 18,
      opportunitiesActioned: 11,
      overallScore: 74,
      performanceTrend: 'down',
      pctDayOnCalls: 60,
      introTime: 1.0,
      authenticationTime: 2.3,
      kycTime: 2.9,
      redemptionDetailsTime: 4.7,
      confirmationsDisclosuresTime: 3.0,
      outroTime: 0.8,
    },
    metricsByPeriod: {
      day: {
        callsPerHour: 3.5,
        averageHandleTime: 14.4,
        afterCallWorkTime: 7.2,
        informationAccuracy: 81,
        securityCompliance: 85,
        callTimeEfficiency: 74,
        conversationalBalance: 71,
        clientConcernsCovered: 63,
        followUpClarity: 76,
        callSentimentPositive: 53,
        callSentimentNeutral: 29,
        callSentimentNegative: 18,
        opportunitiesIdentified: 1,
        opportunitiesActioned: 1,
        overallScore: 76,
        performanceTrend: 'down',
        pctDayOnCalls: 59,
        introTime: 1.0,
        authenticationTime: 2.2,
        kycTime: 2.9,
        redemptionDetailsTime: 4.5,
        confirmationsDisclosuresTime: 3.0,
        outroTime: 0.8,
      },
      week: {
        callsPerHour: 3.8,
        averageHandleTime: 14.6,
        afterCallWorkTime: 7.4,
        informationAccuracy: 80,
        securityCompliance: 84,
        callTimeEfficiency: 73,
        conversationalBalance: 70,
        clientConcernsCovered: 63,
        followUpClarity: 75,
        callSentimentPositive: 55,
        callSentimentNeutral: 28,
        callSentimentNegative: 17,
        opportunitiesIdentified: 6,
        opportunitiesActioned: 4,
        overallScore: 75,
        performanceTrend: 'down',
        pctDayOnCalls: 61,
        introTime: 1.0,
        authenticationTime: 2.3,
        kycTime: 2.9,
        redemptionDetailsTime: 4.6,
        confirmationsDisclosuresTime: 3.0,
        outroTime: 0.8,
      },
      month: {
        callsPerHour: 3.7,
        averageHandleTime: 14.7,
        afterCallWorkTime: 7.5,
        informationAccuracy: 79,
        securityCompliance: 83,
        callTimeEfficiency: 72,
        conversationalBalance: 69,
        clientConcernsCovered: 61,
        followUpClarity: 74,
        callSentimentPositive: 54,
        callSentimentNeutral: 29,
        callSentimentNegative: 17,
        opportunitiesIdentified: 18,
        opportunitiesActioned: 11,
        overallScore: 74,
        performanceTrend: 'down',
        pctDayOnCalls: 60,
        introTime: 1.0,
        authenticationTime: 2.3,
        kycTime: 2.9,
        redemptionDetailsTime: 4.7,
        confirmationsDisclosuresTime: 3.0,
        outroTime: 0.8,
      },
      'all-time': {
        callsPerHour: 3.6,
        averageHandleTime: 15.0,
        afterCallWorkTime: 7.8,
        informationAccuracy: 78,
        securityCompliance: 82,
        callTimeEfficiency: 71,
        conversationalBalance: 68,
        clientConcernsCovered: 60,
        followUpClarity: 73,
        callSentimentPositive: 53,
        callSentimentNeutral: 30,
        callSentimentNegative: 17,
        opportunitiesIdentified: 222,
        opportunitiesActioned: 135,
        overallScore: 73,
        performanceTrend: 'down',
        pctDayOnCalls: 59,
        introTime: 1.0,
        authenticationTime: 2.4,
        kycTime: 3.0,
        redemptionDetailsTime: 4.8,
        confirmationsDisclosuresTime: 3.0,
        outroTime: 0.8,
      }
    }
  }
];

export const getAdvisorById = (id: string): Advisor | undefined => {
  return mockAdvisors.find(advisor => advisor.id === id);
};

export const getTopPerformers = (percentage: number = 25): Advisor[] => {
  const count = Math.ceil(mockAdvisors.length * (percentage / 100));
  return [...mockAdvisors]
    .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
    .slice(0, count);
};

export const getBottomPerformers = (percentage: number = 25): Advisor[] => {
  const count = Math.ceil(mockAdvisors.length * (percentage / 100));
  return [...mockAdvisors]
    .sort((a, b) => a.metrics.overallScore - b.metrics.overallScore)
    .slice(0, count);
};

// Seeded PRNG for deterministic time series
function seededRandom(seed: number) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export type MetricKey = keyof AdvisorMetrics | 'conversionRate';

export interface MetricTimeSeriesPoint {
  label: string;
  date: string;
  [metric: string]: number | string;
}

// Define which metrics are counts (cumulative), averages, or scores
const COUNT_METRICS = ['opportunitiesIdentified', 'opportunitiesActioned'];
const RATE_METRICS = ['callsPerHour'];
const TIME_METRICS = ['averageHandleTime', 'afterCallWorkTime'];
const SEGMENT_METRICS = ['introTime', 'authenticationTime', 'kycTime', 'redemptionDetailsTime', 'confirmationsDisclosuresTime', 'outroTime'];
// All other numeric metrics are score-based (0-100)

export function generateMetricTimeSeries(
  advisorId: string,
  metrics: AdvisorMetrics,
  trend: 'up' | 'down' | 'stable',
  timePeriod: TimePeriod,
  selectedMetrics: MetricKey[],
  weeklyHours: number = 40
): MetricTimeSeriesPoint[] {
  const today = new Date('2026-03-09');
  const points: MetricTimeSeriesPoint[] = [];
  
  // Determine number of data points and label format
  let numPoints: number;
  let getLabel: (i: number) => { label: string; date: string };
  
  switch (timePeriod) {
    case 'day': {
      const dailyHours = weeklyHours / 5;
      numPoints = Math.floor(dailyHours) + 1; // one data point per working hour boundary
      getLabel = (i) => {
        const hour = 9 + i;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour > 12 ? hour - 12 : hour;
        return { label: `${h}${ampm}`, date: `${today.toISOString().split('T')[0]}T${String(hour).padStart(2, '0')}:00` };
      };
      break;
    }
    case 'week':
      numPoints = 7;
      getLabel = (i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return { label: `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`, date: d.toISOString().split('T')[0] };
      };
      break;
    case 'month':
      numPoints = 30;
      getLabel = (i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        return { label: `${d.getMonth() + 1}/${d.getDate()}`, date: d.toISOString().split('T')[0] };
      };
      break;
    case 'all-time':
      numPoints = 12;
      getLabel = (i) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - (11 - i));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return { label: `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, date: d.toISOString().split('T')[0] };
      };
      break;
  }
  
  // Generate data for each point
  for (let i = 0; i < numPoints; i++) {
    const { label, date } = getLabel(i);
    const point: MetricTimeSeriesPoint = { label, date };
    
    // If conversionRate is requested, always generate identified/actioned first
    const needsConversionRate = selectedMetrics.includes('conversionRate');
    const metricsToGenerate = [...selectedMetrics];
    
    // Ensure identified and actioned are generated before conversionRate
    if (needsConversionRate) {
      if (!metricsToGenerate.includes('opportunitiesIdentified')) {
        metricsToGenerate.push('opportunitiesIdentified');
      }
      if (!metricsToGenerate.includes('opportunitiesActioned')) {
        metricsToGenerate.push('opportunitiesActioned');
      }
      // Move conversionRate to end so it's computed after the counts
      const crIdx = metricsToGenerate.indexOf('conversionRate');
      if (crIdx !== -1) {
        metricsToGenerate.splice(crIdx, 1);
        metricsToGenerate.push('conversionRate');
      }
    }
    
    for (const metricKey of metricsToGenerate) {
      const seed = hashString(`${advisorId}-${metricKey}-${i}`);
      const rng = seededRandom(seed);
      const progress = i / (numPoints - 1); // 0 to 1
      
      if (metricKey === 'conversionRate') {
        // Derive from the generated identified/actioned values at this point
        const identified = (point.opportunitiesIdentified as number) || 0;
        const actioned = Math.min((point.opportunitiesActioned as number) || 0, identified);
        point[metricKey] = identified > 0 ? Math.round((actioned / identified) * 100) : 0;
      } else if (COUNT_METRICS.includes(metricKey)) {
        // Count metrics: generate per-period counts
        const totalValue = metrics[metricKey as keyof AdvisorMetrics] as number;
        const avgPerPoint = totalValue / numPoints;
        const trendFactor = trend === 'up' ? 0.7 + progress * 0.6 : trend === 'down' ? 1.3 - progress * 0.6 : 1;
        const noise = 0.7 + rng() * 0.6; // 0.7 to 1.3
        const value = Math.max(0, Math.round(avgPerPoint * trendFactor * noise));
        point[metricKey] = value;
      } else if (RATE_METRICS.includes(metricKey)) {
        // Rate metrics: vary around the average
        const baseValue = metrics[metricKey as keyof AdvisorMetrics] as number;
        const trendOffset = trend === 'up' ? -(progress - 0.5) * 0.5 : trend === 'down' ? (progress - 0.5) * 0.5 : 0;
        const noise = (rng() - 0.5) * 0.5;
        point[metricKey] = Math.max(0, Math.round((baseValue + trendOffset + noise) * 10) / 10);
      } else if (TIME_METRICS.includes(metricKey)) {
        // Time metrics: vary around the average
        const baseValue = metrics[metricKey as keyof AdvisorMetrics] as number;
        const trendOffset = trend === 'up' ? -(progress - 0.5) * 1.5 : trend === 'down' ? (progress - 0.5) * 1.5 : 0;
        const noise = (rng() - 0.5) * 2;
        point[metricKey] = Math.max(1, Math.round((baseValue + trendOffset + noise) * 10) / 10);
      } else if (SEGMENT_METRICS.includes(metricKey)) {
        // Call segment time metrics: small values, vary with minor noise
        const baseValue = metrics[metricKey as keyof AdvisorMetrics] as number;
        const trendOffset = trend === 'up' ? -(progress - 0.5) * 0.3 : trend === 'down' ? (progress - 0.5) * 0.3 : 0;
        const noise = (rng() - 0.5) * 0.4;
        point[metricKey] = Math.max(0.1, Math.round((baseValue + trendOffset + noise) * 10) / 10);
      } else {
        // Score metrics (0-100)
        const baseValue = metrics[metricKey as keyof AdvisorMetrics] as number;
        const trendOffset = trend === 'up' ? (progress - 0.5) * 6 : trend === 'down' ? -(progress - 0.5) * 6 : 0;
        const noise = (rng() - 0.5) * 8;
        point[metricKey] = Math.max(0, Math.min(100, Math.round(baseValue + trendOffset + noise)));
      }
    }
    
    points.push(point);
  }
  
  return points;
}

// Legacy generator kept for backward compatibility
export interface TimeSeriesData {
  date: string;
  value: number;
}

export const generateTimeSeriesData = (baseScore: number, trend: 'up' | 'down' | 'stable', days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const today = new Date('2026-03-04');
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    let value = baseScore;
    
    // Add trend
    if (trend === 'up') {
      value += (days - i) * 0.2;
    } else if (trend === 'down') {
      value -= (days - i) * 0.2;
    }
    
    // Add some randomness
    value += (Math.random() - 0.5) * 5;
    
    // Clamp between 0 and 100
    value = Math.max(0, Math.min(100, value));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 10) / 10
    });
  }
  
  return data;
};

// Per-call metrics for the last day
export interface CallMetrics {
  callId: string;
  callNumber: number;
  timestamp: string; // e.g. "9:05 AM"
  duration: number; // minutes
  // Quality
  callTimeEfficiency: number;
  conversationalBalance: number;
  clientConcernsCovered: number;
  followUpClarity: number;
  // Experience
  callSentimentPositive: number;
  callSentimentNeutral: number;
  callSentimentNegative: number;
  // Compliance
  informationAccuracy: number;
  securityCompliance: number;
  // Opportunities
  opportunityIdentified: boolean;
  opportunityActioned: boolean;
}

export function generateCallLevelMetrics(advisor: Advisor): CallMetrics[] {
  const dayMetrics = advisor.metricsByPeriod.day;
  // Derive number of calls from callsPerHour × daily working hours (weeklyHours / 5)
  const dailyHours = advisor.weeklyHours / 5;
  const numCalls = Math.max(1, Math.round(dayMetrics.callsPerHour * dailyHours));
  const calls: CallMetrics[] = [];

  // Distribute calls across working hours based on daily schedule
  const startHour = 9;
  const endHour = startHour + Math.ceil(dailyHours); // End hour based on daily hours
  const totalMinutes = Math.round(dailyHours * 60);

  // Master RNG for this advisor's call-level data
  const masterRng = seededRandom(hashString(`${advisor.id}-calls-master`));

  // Helper: generate N values that average to exactly `target`, each in [min, max]
  function generateConstrainedValues(n: number, target: number, min: number, max: number, rng: () => number): number[] {
    if (n === 0) return [];
    if (n === 1) return [Math.max(min, Math.min(max, target))];

    // Generate raw random values centered around target
    const raw: number[] = [];
    for (let i = 0; i < n; i++) {
      raw.push(target + (rng() - 0.5) * 20);
    }

    // Shift to match target average
    const rawAvg = raw.reduce((a, b) => a + b, 0) / n;
    const shift = target - rawAvg;
    for (let i = 0; i < n; i++) {
      raw[i] = raw[i] + shift;
    }

    // Clamp and redistribute excess across unclamped values (iterate to converge)
    for (let iter = 0; iter < 5; iter++) {
      let excess = 0;
      let unclamped = 0;
      for (let i = 0; i < n; i++) {
        if (raw[i] < min) { excess += raw[i] - min; raw[i] = min; }
        else if (raw[i] > max) { excess += raw[i] - max; raw[i] = max; }
        else { unclamped++; }
      }
      if (Math.abs(excess) < 0.01 || unclamped === 0) break;
      const perItem = excess / unclamped;
      for (let i = 0; i < n; i++) {
        if (raw[i] > min && raw[i] < max) {
          raw[i] += perItem;
        }
      }
    }

    return raw.map(v => Math.round(Math.max(min, Math.min(max, v))));
  }

  // Helper: pick exactly `count` unique indices from [0, n) using the RNG
  function pickIndices(n: number, count: number, rng: () => number): Set<number> {
    const indices: number[] = [];
    for (let i = 0; i < n; i++) indices.push(i);
    // Fisher-Yates shuffle with seeded RNG
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return new Set(indices.slice(0, Math.min(count, n)));
  }

  // Generate constrained score arrays for each metric so averages match day metrics
  const scoreMetrics: { key: keyof CallMetrics; dayValue: number }[] = [
    { key: 'callTimeEfficiency', dayValue: dayMetrics.callTimeEfficiency },
    { key: 'conversationalBalance', dayValue: dayMetrics.conversationalBalance },
    { key: 'clientConcernsCovered', dayValue: dayMetrics.clientConcernsCovered },
    { key: 'followUpClarity', dayValue: dayMetrics.followUpClarity },
    { key: 'callSentimentPositive', dayValue: dayMetrics.callSentimentPositive },
    { key: 'informationAccuracy', dayValue: dayMetrics.informationAccuracy },
    { key: 'securityCompliance', dayValue: dayMetrics.securityCompliance },
  ];

  const scoreArrays: Record<string, number[]> = {};
  for (const metric of scoreMetrics) {
    const metricRng = seededRandom(hashString(`${advisor.id}-callscores-${metric.key}`));
    const [min, max] = metric.key === 'clientConcernsCovered' ? [50, 100] : [0, 100];
    scoreArrays[metric.key] = generateConstrainedValues(numCalls, metric.dayValue, min, max, metricRng);
  }

  // Derive neutral/negative from positive so they sum to 100
  const posRatio = dayMetrics.callSentimentPositive / 100;
  const neuRatio = dayMetrics.callSentimentNeutral / 100;
  const sentimentArrays = { pos: scoreArrays['callSentimentPositive'], neu: [] as number[], neg: [] as number[] };
  for (let i = 0; i < numCalls; i++) {
    const pos = sentimentArrays.pos[i];
    const remaining = 100 - pos;
    const neu = Math.max(0, Math.min(remaining, Math.round(remaining * (neuRatio / (1 - posRatio + 0.001)))));
    sentimentArrays.neu.push(neu);
    sentimentArrays.neg.push(100 - pos - neu);
  }

  // Generate constrained durations so average matches AHT
  const durationRng = seededRandom(hashString(`${advisor.id}-callduration`));
  const durations = generateConstrainedValues(numCalls, dayMetrics.averageHandleTime * 10, 20, 300, durationRng)
    .map(v => v / 10); // convert back from tenths of minutes

  // Pick exactly which calls have opportunities identified/actioned
  const identifiedCount = Math.min(dayMetrics.opportunitiesIdentified, numCalls);
  const actionedCount = Math.min(dayMetrics.opportunitiesActioned, identifiedCount);
  
  const oppRng = seededRandom(hashString(`${advisor.id}-callopps`));
  const identifiedCalls = pickIndices(numCalls, identifiedCount, oppRng);
  const identifiedArray = Array.from(identifiedCalls);
  // From identified calls, pick which ones are actioned
  const actionedRng = seededRandom(hashString(`${advisor.id}-callactions`));
  const actionedFromIdentified = pickIndices(identifiedArray.length, actionedCount, actionedRng);
  const actionedCalls = new Set<number>();
  let actionIdx = 0;
  for (const idx of identifiedArray) {
    if (actionedFromIdentified.has(actionIdx)) {
      actionedCalls.add(idx);
    }
    actionIdx++;
  }

  for (let i = 0; i < numCalls; i++) {
    const seed = hashString(`${advisor.id}-call-${i}`);
    const rng = seededRandom(seed);

    // Spread calls evenly with some noise
    const baseMinute = Math.round((i / numCalls) * totalMinutes);
    const noiseMinute = Math.round((rng() - 0.5) * 15);
    const minuteOfDay = Math.max(0, Math.min(totalMinutes - 1, baseMinute + noiseMinute));
    const hour = startHour + Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timestamp = `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;

    calls.push({
      callId: `${advisor.id}-D-${String(i + 1).padStart(3, '0')}`,
      callNumber: i + 1,
      timestamp,
      duration: durations[i],
      callTimeEfficiency: scoreArrays['callTimeEfficiency'][i],
      conversationalBalance: scoreArrays['conversationalBalance'][i],
      clientConcernsCovered: scoreArrays['clientConcernsCovered'][i],
      followUpClarity: scoreArrays['followUpClarity'][i],
      callSentimentPositive: sentimentArrays.pos[i],
      callSentimentNeutral: sentimentArrays.neu[i],
      callSentimentNegative: sentimentArrays.neg[i],
      informationAccuracy: scoreArrays['informationAccuracy'][i],
      securityCompliance: scoreArrays['securityCompliance'][i],
      opportunityIdentified: identifiedCalls.has(i),
      opportunityActioned: actionedCalls.has(i),
    });
  }

  return calls;
}
