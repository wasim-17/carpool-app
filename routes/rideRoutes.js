import express from 'express';
const router = express.Router();
import { 
  createRide, 
  searchRides, 
  getRideById, 
  updateRide, 
  cancelRide 
} from '../controllers/rideController.js';

router.post("/", createRide);           // POST /api/rides
router.get("/search", searchRides);      // GET /api/rides/search
router.get("/:id", getRideById);         // GET /api/rides/:id
router.patch("/:id", updateRide);        // PATCH /api/rides/:id
router.delete("/:id", cancelRide);       // DELETE /api/rides/:id

export default router;