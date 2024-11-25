import { authMiddleware } from "@/middleware/auth";
import { IncidentModel } from "@/models/incident";
import { Request, Response, Router } from "express";

const router = Router();

router.post(
  "/incidents",
  authMiddleware,
  async (req: Request, res: Response) => {
    const reportedBy = req.auth?.id;
    try {
      const incident = new IncidentModel({ ...req.body, reportedBy });
      await incident.save();
      const incidentWithUser = await IncidentModel.findById(
        incident._id
      ).populate("reportedBy");
      res.status(201).send(incidentWithUser);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

router.get(
  "/incidents",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const incidents = await IncidentModel.find().populate("reportedBy");
      return res.status(200).send(incidents);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

router.get(
  "/incidents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const incident = await IncidentModel.findById(req.params.id);
      if (!incident) {
        return res.status(404).send();
      }
      res.status(200).send(incident);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.patch(
  "/incidents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "type",
      "title",
      "description",
      "latitude",
      "longitude",
      "timestamp",
      "severity",
      "reportedBy",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
      const incident = await IncidentModel.findById(req.params.id);

      if (!incident) {
        return res.status(404).send();
      }

      updates.forEach(
        (update) => ((incident as any)[update] = req.body[update])
      );
      await incident.save();
      res.status(200).send(incident);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

router.delete(
  "/incidents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const incident = await IncidentModel.findByIdAndDelete(req.params.id);

      if (!incident) {
        return res.status(404).send();
      }

      res.status(200).send(incident);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

export default router;
