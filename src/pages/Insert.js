import React, { useEffect } from "react";
import { query, where, getDocs, collection, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const InsertSampleData = () => {
  useEffect(() => {
    const insertData = async () => {
      const uidToMatch = "NN8d2qzJqTTbinnFPP9En1s1XL42"; // UID to match
      const programmesRef = collection(db, "programmes");

      const programmeData = {
        about: "A tech startup focused on AI-driven solutions.",
        accountType: "email",
        address: "123 Tech Park, Silicon Valley, CA",
        category: "Incubator",
        companyName: "TechNova AI",
        createdAt: new Date("2024-11-16T23:41:31+05:30"),
        customId: "304s1g9ix1731780752333",
        email: "contact@technova.com",
        founderName: "John Doe",
        lastLogin: new Date("2024-11-16T23:41:31+05:30"),
        logo: "https://example.com/logo.png",
        mobile: "9876543210",
        phoneNumber: null,
        semail: "support@technova.com",
        signUpMethod: "email",
        socialMedia: "https://linkedin.com/in/technova",
        timestamp: new Date("2024-11-16T23:42:32+05:30"),
        website: "https://www.technova.com",
      };

      const questions = {
        question1: {
          question: "What are your long-term goals, and how does this startup contribute to achieving them?",
          answer:
            "Our long-term goal is to become a leading provider of AI-powered solutions that enhance productivity across industries. TechNova AI focuses on developing scalable solutions that cater to businesses of all sizes.",
        },
        question2: {
          question: "Why do you want to join this incubator, and how do you think it will benefit your startup journey?",
          answer:
            "Joining this incubator provides access to a network of industry experts, mentors, and potential investors, crucial for scaling our startup. The resources and guidance offered will help refine our product development strategy.",
        },
        question3: {
          question: "What inspired you to pursue this startup idea, and what problem are you solving?",
          answer:
            "The idea was inspired by observing inefficiencies in data processing and decision-making. Our startup addresses the gap by offering cost-effective, AI-driven solutions.",
        },
      };

      try {
        // Query Firestore to find the document with the matching uid
        const q = query(programmesRef, where("uid", "==", uidToMatch));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("No matching document found for the given UID.");
          return;
        }

        // Assuming there's only one document with the given UID
        const matchedDoc = querySnapshot.docs[0];
        const matchedDocRef = matchedDoc.ref;

        // Update the programme data (optional)
        await updateDoc(matchedDocRef, programmeData);

        // Create a single document in the formResponses subcollection
        const responsesCollection = collection(matchedDocRef, "formResponses");
        const formResponseData = {
          ...programmeData,
          ...questions,
        };

        // Use a custom document ID for the form response (optional)
        const customResponseDocId = "response1"; // Replace with any unique ID
        const responseDocRef = doc(responsesCollection, customResponseDocId);

        await setDoc(responseDocRef, formResponseData);

        console.log("Data successfully inserted in a single document!");
      } catch (error) {
        console.error("Error inserting data: ", error);
      }
    };

    insertData();
  }, []);

  return <div>Inserting Sample Data...</div>;
};

export default InsertSampleData;
