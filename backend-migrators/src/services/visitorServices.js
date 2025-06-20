import fs from 'fs';
import path from 'path';

const IP_LOG_FILE = path.join(process.cwd(), 'config', 'visitors.json');

export const logIP = (ip) => {
    let data = [];

    if (fs.existsSync(IP_LOG_FILE)) {
        const fileContent = fs.readFileSync(IP_LOG_FILE, 'utf8');
        data = fileContent ? JSON.parse(fileContent) : [];
    }

    if (!data.includes(ip)) {
        data.push(ip);
        fs.writeFileSync(IP_LOG_FILE, JSON.stringify(data, null, 2));
        console.log(`📌 Nueva visita registrada: ${ip}`);
    }
};

export const getVisitorStats = () => {
    let data = [];
    if (fs.existsSync(IP_LOG_FILE)) {
        const fileContent = fs.readFileSync(IP_LOG_FILE, 'utf8');
        data = fileContent ? JSON.parse(fileContent) : [];
    }
    return { totalVisitors: data.length, ips: data };
};