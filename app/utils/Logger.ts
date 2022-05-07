import winston, { format, createLogger, transports } from 'winston'
import path from 'path'
const { combine, timestamp, prettyPrint } = format

const getPathToLogs = (filename) => path.resolve(__dirname, `../../logs/${filename}`)

const Logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.File({ filename: getPathToLogs('combined.log'), level: 'info' }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: getPathToLogs('exceptions.log') })
    ]
})


export default Logger