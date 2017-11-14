import moment from 'moment'

export default {
  getFormattedDate(timestamp, format="MMMM Do, YYYY") {
    //'MMMM Do, YYYY h:mm a' ex: August 11th, 2017 4:00 pm
    if (timestamp)
      return moment.utc(timestamp).format(format)
    return null
  },

  getTimeDifferenceFromUnits(dateStart, dateEnd=moment.utc(), units='days') {
    dateEnd = dateEnd || moment.utc()
    return moment.utc(dateEnd).diff(moment.utc(dateStart), units)
  },

  getTimeDifferenceObj(dateStart, dateEnd=moment().toDate(), calculateNegativeDiff=false) {
    if (typeof dateStart === 'undefined') return false

    dateStart = moment(dateStart).toDate()
    dateEnd   = moment(dateEnd).toDate()
    let ret   = {
      days:     0,
      hours:    0,
      minutes:  0,
      seconds:  0
    }

    const dateDiff  = dateEnd.getTime() - dateStart.getTime()
    const msDiff = (calculateNegativeDiff) ? Math.abs(dateDiff) : dateDiff
    const duration = moment.duration(msDiff, 'milliseconds')

    return {
      years:    duration.years(),
      months:   duration.months(),
      weeks:    duration.weeks(),
      days:     duration.days(),
      hours:    duration.hours(),
      minutes:  duration.minutes(),
      seconds:  duration.seconds()
    }
  },

  getTimeFromNow(time) {
    return moment.utc(time).fromNow()
  }
}
