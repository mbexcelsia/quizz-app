// functions/deleteUser.js
const admin = require("firebase-admin");

exports.deleteUser = async (req, res) => {
  try {
    // Vérifier que la requête vient d'un admin
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Vérifier dans Firestore si l'utilisateur est admin
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    const userIdToDelete = req.body.userId;

    // Supprimer le compte d'authentification
    await admin.auth().deleteUser(userIdToDelete);

    // Supprimer le document Firestore
    await admin.firestore().collection("users").doc(userIdToDelete).delete();

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
};
