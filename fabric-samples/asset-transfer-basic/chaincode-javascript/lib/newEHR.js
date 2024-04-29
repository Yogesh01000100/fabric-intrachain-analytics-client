"use strict";
const { Contract } = require("fabric-contract-api");
const {
  checkCF1Role,
  checkCF2Role,
  checkCF3Role,
  checkCF4Role,
  checkCF5Role,
} = require("./role-check.js");

const { checkC1 } = require("./capability-check.js");

class EHRContract extends Contract {
  async initLedger(ctx) {
    const hospitalData = [
      {
        id: "HOSP1001",
        name: "Sunrise Health Medical Center",
        address: {
          street: "2500 Wellness Way",
          city: "Healville",
          state: "HS",
          zipCode: "12345",
        },
        contact: {
          phone: "123-456-7890",
          fax: "123-456-7891",
          email: "info@sunrisehealthmc.com",
        },
        departments: [
          "Emergency",
          "Cardiology",
          "Neurology",
          "Pediatrics",
          "Oncology",
        ],
        services: [
          "24/7 Emergency Services",
          "Heart and Vascular Care",
          "Comprehensive Stroke Center",
          "Children’s Health Services",
          "Cancer Treatment and Research",
        ],
        facilities: [
          "State-of-the-art Operating Rooms",
          "Advanced Imaging Center",
          "Family Birthing Suites",
          "Pediatric Intensive Care Unit",
          "Dedicated Oncology Ward",
        ],
      },
    ];

    for (const record of hospitalData) {
      await ctx.stub.putState(record.id, Buffer.from(JSON.stringify(record)));
      console.info(`Hospital record ${record.id} initialized`);
    }
  }

  async commonFunction1(ctx) {
    const validUser = await checkCF1Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalId = "HOSP1001";
    const hospitalDetailsBuffer = await ctx.stub.getState(hospitalId);
    if (!hospitalDetailsBuffer || hospitalDetailsBuffer.length === 0) {
      throw new Error(`No hospital details found for ID: ${hospitalId}`);
    }

    const hospitalDetails = JSON.parse(hospitalDetailsBuffer.toString());
    return hospitalDetails;
  }

  async commonFunction2(ctx) {
    const validUser = await checkCF2Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalId = "HOSP1001";
    const hospitalDetailsBuffer = await ctx.stub.getState(hospitalId);
    if (!hospitalDetailsBuffer || hospitalDetailsBuffer.length === 0) {
      throw new Error(`No hospital details found for ID: ${hospitalId}`);
    }

    const hospitalDetails = JSON.parse(hospitalDetailsBuffer.toString());
    return hospitalDetails;
  }

  async commonFunction3(ctx) {
    const validUser = await checkCF3Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalId = "HOSP1001";
    const hospitalDetailsBuffer = await ctx.stub.getState(hospitalId);
    if (!hospitalDetailsBuffer || hospitalDetailsBuffer.length === 0) {
      throw new Error(`No hospital details found for ID: ${hospitalId}`);
    }

    const hospitalDetails = JSON.parse(hospitalDetailsBuffer.toString());
    return hospitalDetails;
  }

  async commonFunction4(ctx) {
    const validUser = await checkCF4Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalId = "HOSP1001";
    const hospitalDetailsBuffer = await ctx.stub.getState(hospitalId);
    if (!hospitalDetailsBuffer || hospitalDetailsBuffer.length === 0) {
      throw new Error(`No hospital details found for ID: ${hospitalId}`);
    }

    const hospitalDetails = JSON.parse(hospitalDetailsBuffer.toString());
    return hospitalDetails;
  }

  async commonFunction5(ctx) {
    const validUser = await checkCF5Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const hospitalId = "HOSP1001";
    const hospitalDetailsBuffer = await ctx.stub.getState(hospitalId);
    if (!hospitalDetailsBuffer || hospitalDetailsBuffer.length === 0) {
      throw new Error(`No hospital details found for ID: ${hospitalId}`);
    }

    const hospitalDetails = JSON.parse(hospitalDetailsBuffer.toString());
    return hospitalDetails;
  }

  async UploadEHR(ctx, patientId, data) {
    const validUser = await checkCF1Role(ctx.stub);
    const validCapability = await checkC1(ctx.stub);
    if (!validUser || !validCapability) {
      throw new Error("Access denied. Insufficient permissions.");
    }
    const patientKey = `patient_${patientId}`;
    const exists = await this.UserExists(ctx, patientKey);
    if (exists) {
      throw new Error(`The patient with ID ${patientId} already exists`);
    }
    const patient = { type: "patient", ...JSON.parse(data) };
    await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patient)));
  }

  async CreateDoctor(ctx, doctorId, data) {
    const doctorKey = `doctor_${doctorId}`;
    const exists = await this.UserExists(ctx, doctorKey);
    if (exists) {
      throw new Error(`The doctor with ID ${doctorId} already exists`);
    }
    const doctor = { type: "doctor", u_id: doctorId, ...JSON.parse(data) };
    await ctx.stub.putState(doctorKey, Buffer.from(JSON.stringify(doctor)));
  }

  async UserExists(ctx, key) {
    const record = await ctx.stub.getState(key);
    return !!record && record.length > 0;
  }
}

module.exports = EHRContract;
