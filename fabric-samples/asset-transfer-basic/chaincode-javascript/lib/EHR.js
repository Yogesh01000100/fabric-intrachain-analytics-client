'use strict';
const { Contract } = require('fabric-contract-api');
const { checkPatientRole, checkAsstDoctorRole, checkDoctorRole } = require('./role-check.js');
const { checkPatientCapability } = require('./capability-check.js');

class EHRContract extends Contract {


    async InitLedger(ctx) {
        const networkData = [
            {
                u_id: 'd49a5287-7739-5b2e-badc-5afecce1180c',
                role: 'doctor',
                first_name: 'Aradhya',
                last_name: 'Kurian',
                specialty: 'Other',
                contact_email: 'aradhya.kurian@gmail.com',
                contact_phone: '7458868037',
                network_id: 'HSPA',
                organization: 'org1'
            },
            {
                u_id: '7c25291d-632e-5123-9a86-10e32b2a5c68',
                role: 'doctor',
                first_name: 'Darshit',
                last_name: 'Amble',
                specialty: 'Dermatology',
                contact_email: 'darshit.amble@gmail.com',
                contact_phone: '3547847802',
                network_id: 'HSPA',
                organization: 'org1'
            },
            {
                u_id: 'ffd06eda-2ed5-57fd-be18-79349299b8ed',
                role: 'doctor',
                first_name: 'Prisha',
                last_name: 'Saxena',
                specialty: 'Cardiology',
                contact_email: 'prisha.saxena@gmail.com',
                contact_phone: '0538681448',
                network_id: 'HSPA',
                organization: 'org1'
            },
            {
                u_id: 'ab04032a-af7c-51b9-b661-14304ee96848',
                role: 'patient',
                first_name: 'Samiha',
                last_name: 'Arya',
                date_of_birth: '1971-12-26',
                gender: 'Female',
                address: 'H.No. 740\nChandran Path\nDanapur 025588',
                contact_email: 'samiha.arya@gmail.com',
                contact_phone: '04362431066',
                emergency_contact_name: 'Inaaya  Bajaj',
                emergency_contact_phone: '+919658138852',
                network_id: 'HSPB',
                organization: 'org1',
                data: []
            },
            {
                u_id: '660992eb-ee20-59a1-9a0f-b37f54f0bff2',
                role: 'patient',
                first_name: 'Kismat',
                last_name: 'Kalita',
                date_of_birth: '1936-04-12',
                gender: 'Female',
                address: '687\nChaudry Circle\nPimpri-Chinchwad-514935',
                contact_email: 'kismat.kalita@gmail.com',
                contact_phone: '7114421369',
                emergency_contact_name: 'Shray Bandi',
                emergency_contact_phone: '+912203832495',
                network_id: 'HSPA',
                organization: 'org1',
                data: []
            },
            {
                u_id: '91883d87-b98b-5841-896f-e4d6aa731c95',
                role: 'patient',
                first_name: 'Baiju',
                last_name: 'Shroff',
                date_of_birth: '1992-01-18',
                gender: 'Male',
                address: '044\nGuha Marg\nKirari Suleman Nagar-848413',
                contact_email: 'baiju.shroff@gmail.com',
                contact_phone: '9878250598',
                emergency_contact_name: 'Biju Khatri',
                emergency_contact_phone: '9748884235',
                network_id: 'HSPA',
                organization: 'org1',
                data: []
            },
            {
                u_id: '122f782c-7215-5a08-ae98-47b888486cef',
                role: 'assistant_doctor',
                first_name: 'Shlok',
                last_name: 'Cheema',
                specialty: 'Pediatrics',
                supervisor_id: 'd49a5287-7739-5b2e-badc-5afecce1180c',
                contact_email: 'shlok.cheema@gmail.com',
                contact_phone: '+911271502789',
                network_id: 'HSPA',
                organization: 'org1'
            }
        ];
        for (const record of networkData) {
            await ctx.stub.putState(record.u_id, Buffer.from(JSON.stringify(record)));
            console.info(`user record ${record.u_id} initialized`);
        }
    }


    // Create Doctor
    async CreateDoctor(ctx, doctor_id, data) {
        try {
            const validUser = await checkDoctorRole(ctx.stub);

            if (!validUser) {
                throw new Error('Access denied. Insufficient permissions.');
            }

            const exists = await this.UserExists(ctx, doctor_id);
            if (exists) {
                throw new Error(`The doctor with ID ${doctor_id} already exists`);
            }

            const doctor = { u_id: doctor_id, data: data };
            await ctx.stub.putState(doctor_id, Buffer.from(JSON.stringify(doctor)));
        } catch (error) {
            console.error('An error occurred in CreateDoctor:', error.message);
            throw error;
        }
    }

    // Create Patient
    async CreatePatient(ctx, patient_id, data) {
        try {
            const validUser = await checkPatientRole(ctx.stub);

            if (!validUser) {
                throw new Error('Access denied. Insufficient permissions.');
            }

            const exists = await this.UserExists(ctx, patient_id);
            if (exists) {
                throw new Error(`The patient with ID ${patient_id} already exists`);
            }

            const patient = { u_id: patient_id, data: data };
            await ctx.stub.putState(patient_id, Buffer.from(JSON.stringify(patient)));
        } catch (error) {
            console.error('An error occurred in CreatePatient:', error.message);
            throw error;
        }
    }

    async GetMyProfileDoctor(ctx, user_id) {
        try {
            const validUser = await checkDoctorRole(ctx.stub);

            if (!validUser) {
                throw new Error('Access denied. Insufficient permissions.');
            }

            const userExists = await this.UserExists(ctx, user_id);
            if (!userExists) {
                throw new Error(`The user with ID ${user_id} does not exist`);
            }

            const userData = await ctx.stub.getState(user_id);
            const userProfile = JSON.parse(userData.toString());

            return JSON.stringify(userProfile);
        } catch (error) {
            console.error('An error occurred:', error.message);
            throw error;
        }
    }

    async GetMyProfilePatient(ctx, u_id) {
        try {
            const validUser = await checkPatientRole(ctx.stub);

            if (!validUser) {
                throw new Error('Access denied. Insufficient permissions.');
            }

            const accessStatus=await checkPatientCapability(ctx.stub, 'ViewPersonalRecords');

            if (!accessStatus) {
                throw new Error('Access denied. Insufficient capabilites!');
            }

            const userExists = await this.UserExists(ctx, u_id);
            if (!userExists) {
                throw new Error(`The user with ID ${u_id} does not exist`);
            }

            const userData = await ctx.stub.getState(u_id);
            const userProfile = JSON.parse(userData.toString());

            return JSON.stringify(userProfile);
        } catch (error) {
            console.error('An error occurred:', error.message);
            throw error;
        }
    }

    async GetMyProfileAssistantDoctor(ctx, user_id) {
        try {
            const validUser = await checkAsstDoctorRole(ctx.stub);

            if (!validUser) {
                throw new Error('Access denied. Insufficient permissions.');
            }

            const userExists = await this.UserExists(ctx, user_id);
            if (!userExists) {
                throw new Error(`The user with ID ${user_id} does not exist`);
            }

            const userData = await ctx.stub.getState(user_id);
            const userProfile = JSON.parse(userData.toString());

            return JSON.stringify(userProfile);
        } catch (error) {
            console.error('An error occurred:', error.message);
            throw error;
        }
    }

    async UserExists(ctx, u_id) {
        const record = await ctx.stub.getState(u_id);
        return !!record && record.length > 0;
    }
}

module.exports = EHRContract;