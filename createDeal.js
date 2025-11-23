const express = require("express");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(express.json());

const API = process.env.API_KEY;
const BASE = process.env.BASE_URL;
const PORT = 3000;

// Your Pipedrive custom field keys
const FIELD_MAP = {
  invested_before: "54260bf8ec9a8889b2e7240407a4ad41be67244a",
  service_preference: "e5181d868e3ee41b275e6091b859a0a004e10a74",
  location_preference: "4428ed0fe2d45f133b29796f9825670457b4f4d2",
  referral_source: "8ed8ebd894b65f4d2b234f898b21f58351ccca12",
  investment_timeline: "b5ce26fe31ff0d3d15dcfd8e958aee672d1f7569",
  investment_budget: "4fa93808a092b411ee9fbaa43f29f0fae5558497",
  decision_maker: "c4c8a06861d1b17a13dc15c7d80f1bbdb73670e6",
  form_source: "d2aa036e8eee8e33829bd82d44aaa936cd226929",
  notes: "ba7081b96272a8d37b94ef4c2ee09ded29cd2bd4"
};

app.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    // --------------------------
    // 1. Create Person
    // --------------------------
    const personPayload = {
      name: data.full_name,
      email: data.email,
      phone: data.phone,
      org_id: 1
    };

    const personRes = await axios.post(
      `${BASE}/persons?api_token=${API}`,
      personPayload
    );

    const personId = personRes.data.data.id;

    // --------------------------
    // 2. Create Deal
    // --------------------------
    const dealPayload = {
      title: `Property Investment Lead - ${data.full_name}`,
      value: 400000,
      currency: "GBP",
      expected_close_date: "2025-12-30",

      person_id: personId,
      org_id: 1,
      pipeline_id: 1,
      stage_id: 2
    };

    // Dynamically map JSON fields to custom field keys
    for (const key in FIELD_MAP) {
      if (data[key]) {
        const fieldKey = FIELD_MAP[key];
        dealPayload[fieldKey] = data[key];
      }
    }

    const dealRes = await axios.post(
      `${BASE}/deals?api_token=${API}`,
      dealPayload
    );

    res.json({
      success: true,
      person: personRes.data.data,
      deal: dealRes.data.data
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({
      success: false,
      error: err?.response?.data || err.message
    });
  }
});

app.listen(PORT, () => console.log("Server running on port 3000"));
