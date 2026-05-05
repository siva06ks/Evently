import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { WebView } from "react-native-webview";
import QRCode from "react-native-qrcode-svg";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import { getEventById, type WarmthEvent, useWarmthStore } from "../../store/useWarmthStore";
import { attendeeNavIcons, organizerNavIcons } from "./navIcons";
import {
  WarmthBottomNav,
  WarmthButton,
  WarmthField,
  WarmthHeaderAction,
  WarmthShell,
  warmthColors,
} from "./WarmthUI";

function attendeeBottomBar(
  active: "home" | "saved" | "tickets" | "profile",
  navigation: any,
  firstTicket?: { eventId: string; attendeeName: string; ticketId: string }
) {
  return (
    <WarmthBottomNav
      items={[
        {
          key: "home",
          label: "Home",
          iconName: attendeeNavIcons.home,
          active: active === "home",
          onPress: () => navigation.navigate("HomeFeed"),
        },
        {
          key: "saved",
          label: "Saved",
          iconName: attendeeNavIcons.saved,
          active: active === "saved",
          onPress: () => navigation.navigate("OfflineHub"),
        },
        {
          key: "tickets",
          label: "Tickets",
          iconName: attendeeNavIcons.tickets,
          active: active === "tickets",
          onPress: () => {
            if (firstTicket) {
              navigation.navigate("QRTicket", {
                eventId: firstTicket.eventId,
                attendeeName: firstTicket.attendeeName,
                ticketId: firstTicket.ticketId,
              });
            } else {
              Alert.alert("No tickets yet", "Book an event from the home feed to see your ticket here.");
            }
          },
        },
        {
          key: "profile",
          label: "Profile",
          iconName: attendeeNavIcons.profile,
          active: active === "profile",
          onPress: () => navigation.navigate("Profile"),
        },
      ]}
    />
  );
}

function organizerBottomBar(
  active: "events" | "create" | "tickets" | "help",
  navigation: any
) {
  return (
    <WarmthBottomNav
      items={[
        {
          key: "events",
          label: "Events",
          iconName: organizerNavIcons.events,
          active: active === "events",
          onPress: () => navigation.navigate("OfflineHub"),
        },
        {
          key: "create",
          label: "Create",
          iconName: organizerNavIcons.create,
          active: active === "create",
          onPress: () => navigation.navigate("CreateEvent"),
        },
        {
          key: "tickets",
          label: "Tickets",
          iconName: organizerNavIcons.tickets,
          active: active === "tickets",
          onPress: () => navigation.navigate("TicketLimits"),
        },
        {
          key: "help",
          label: "Help",
          iconName: organizerNavIcons.help,
          active: active === "help",
          onPress: () => navigation.navigate("Profile"),
        },
      ]}
    />
  );
}

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Login">) {
  const [mode, setMode] = useState<"gmail" | "phone">("phone");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <WarmthShell title="Evently" noHeader contentStyle={styles.loginShellContent}>
      <View style={styles.loginCard}>
        <View style={styles.loginIconBadge}>
          <MaterialCommunityIcons name="card-account-details-outline" size={28} color="#5d2f00" />
        </View>
        <Text style={styles.loginBrand}>Evently</Text>
        <Text style={styles.loginSubtitle}>Welcome back. Let's get you{"\n"}signed in.</Text>

        <View style={styles.loginToggle}>
          <Pressable style={[styles.loginToggleChip, mode === "gmail" && styles.loginToggleChipActive]} onPress={() => setMode("gmail")}>
            <MaterialCommunityIcons name="email-outline" size={16} color={mode === "gmail" ? "#5d2f00" : "#554336"} />
            <Text style={[styles.loginToggleText, mode === "gmail" && styles.loginToggleTextActive]}>Gmail</Text>
          </Pressable>
          <Pressable style={[styles.loginToggleChip, mode === "phone" && styles.loginToggleChipActive]} onPress={() => setMode("phone")}>
            <MaterialCommunityIcons name="card-account-phone-outline" size={16} color={mode === "phone" ? "#5d2f00" : "#554336"} />
            <Text style={[styles.loginToggleText, mode === "phone" && styles.loginToggleTextActive]}>Phone</Text>
          </Pressable>
        </View>

        {mode === "phone" ? (
          <View style={styles.loginFieldWrap}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.loginInputRow}>
              <MaterialCommunityIcons name="phone-outline" size={18} color="#6b5a4c" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9a8574"
                style={styles.loginInput}
              />
            </View>
          </View>
        ) : (
          <WarmthField label="Email" value={phone} onChangeText={setPhone} placeholder="you@example.com" />
        )}

        <WarmthButton
          label={sending ? "Sending…" : "Send Code"}
          primary
          onPress={async () => {
            if (!phone.trim()) {
              Alert.alert("Required", "Enter your phone or email first.");
              return;
            }
            setSending(true);
            try {
              await api.post("/auth/send-code", { identifier: phone.trim() });
              navigation.navigate("OTP", { identifier: phone.trim() });
            } catch (e: unknown) {
              const err = e as { response?: { data?: { message?: string } }; message?: string };
              Alert.alert(
                "Could not send code",
                err?.response?.data?.message ?? err?.message ?? "Check that the API is running."
              );
            } finally {
              setSending(false);
            }
          }}
        />

        <Text style={styles.loginLegal}>
          By continuing, you agree to Evently's{"\n"}
          <Text style={styles.loginLegalLink}>Terms of Service</Text> and <Text style={styles.loginLegalLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </WarmthShell>
  );
}

export function OTPScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, "OTP">) {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(45);
  const [verifying, setVerifying] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const refreshFromApi = useWarmthStore((s) => s.refreshFromApi);
  const isReady = /^\d{4}$/.test(code);

  useEffect(() => {
    const id = setInterval(() => setSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <WarmthShell
      title="Verification"
      leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
      rightAction={<WarmthHeaderAction label="Help" />}
    >
      <Text style={styles.title}>Enter your code</Text>
      <Text style={styles.subtitle}>We sent a 4-digit OTP to {route.params.identifier}</Text>
      <TextInput
        style={styles.otpInput}
        value={code}
        onChangeText={(value) => {
          const digits = value.replace(/\D/g, "").slice(0, 4);
          setCode(digits);
        }}
        keyboardType="number-pad"
        maxLength={4}
        autoFocus
        placeholder="1234"
        placeholderTextColor="#9a8574"
      />
      <Text style={styles.subtleCenter}>
        {seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, "0")}` : "You can resend now"}
      </Text>
      <WarmthButton
        label={verifying ? "Verifying…" : "Verify & Continue"}
        primary
        onPress={async () => {
          if (!isReady) {
            Alert.alert("Invalid OTP", "Please fill all 4 digits.");
            return;
          }
          setVerifying(true);
          try {
            const { data } = await api.post<{
              token: string;
              user: { id: number; identifier: string; totalCapacity: number; earlyBirdLimit: number };
            }>("/auth/verify", {
              identifier: route.params.identifier,
              code,
            });
            setSession(data.token, {
              id: data.user.id,
              identifier: data.user.identifier,
              totalCapacity: data.user.totalCapacity,
              earlyBirdLimit: data.user.earlyBirdLimit,
            });
            await refreshFromApi();
            navigation.replace("HomeFeed");
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            Alert.alert(
              "Verification failed",
              err?.response?.data?.message ?? err?.message ?? "Try again or use demo code 1234."
            );
          } finally {
            setVerifying(false);
          }
        }}
      />
    </WarmthShell>
  );
}

export function HomeFeedScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "HomeFeed">) {
  const events = useWarmthStore((state) => state.events);
  const savedEventIds = useWarmthStore((state) => state.savedEventIds);
  const toggleSavedEvent = useWarmthStore((state) => state.toggleSavedEvent);
  const loading = useWarmthStore((state) => state.loading);
  const refreshFromApi = useWarmthStore((state) => state.refreshFromApi);
  const tickets = useWarmthStore((state) => state.tickets);
  const firstTicket = tickets[0];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | "Arts" | "Health" | "Social" | "Learning" | "Technology">(
    "All"
  );

  useFocusEffect(
    useCallback(() => {
      refreshFromApi();
    }, [refreshFromApi])
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const categoryOk = category === "All" || event.category === category;
        const searchOk =
          search.trim().length === 0 ||
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.location.toLowerCase().includes(search.toLowerCase());
        return categoryOk && searchOk;
      }),
    [events, search, category]
  );

  return (
    <WarmthShell
      title="Evently"
      leftAction={<WarmthHeaderAction label="Menu" />}
      rightAction={
        <WarmthHeaderAction label="Search" onPress={() => Alert.alert("Search", "Search input is below.")} />
      }
      bottomBar={attendeeBottomBar("home", navigation, firstTicket)}
    >
      {loading && events.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color="#f28c28" />
          <Text style={styles.subtitle}>Loading events…</Text>
        </View>
      ) : null}
      <WarmthField
        label="Search"
        value={search}
        onChangeText={setSearch}
        placeholder="Find events, workshops, or activities..."
      />
      <View style={styles.rowWrap}>
        {(["All", "Arts", "Health", "Social", "Learning", "Technology"] as const).map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.title, styles.sectionGap]}>Featured for You</Text>

      {filteredEvents.map((event) => {
        const saved = savedEventIds.includes(event.id);
        return (
          <Pressable key={event.id} style={styles.card} onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}>
            <Image source={{ uri: event.heroImageUrl ?? DEFAULT_HERO }} style={styles.cardImage} />
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Pressable onPress={() => toggleSavedEvent(event.id)}>
                <Text style={styles.saveBtn}>{saved ? "Saved" : "Save"}</Text>
              </Pressable>
            </View>
            <Text style={styles.cardMeta}>{event.dateLabel}</Text>
            <Text style={styles.cardMeta}>{event.location}</Text>
            <Text style={styles.price}>{event.priceLabel}</Text>
          </Pressable>
        );
      })}

      <WarmthButton label="Create Event" onPress={() => navigation.navigate("CreateEvent")} />
    </WarmthShell>
  );
}

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&w=1200&q=80";

function openNativeMap(location: string) {
  const query = encodeURIComponent(location || "community center");
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
  return Linking.openURL(url);
}

function getEventDetailModel(event: WarmthEvent) {
  const parts = event.dateLabel
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    summary: event.summary ?? event.description,
    dateDetail: event.dateDetail ?? (parts[0] ?? event.dateLabel),
    timeRange: event.timeRange ?? (parts[1] ?? "See schedule"),
    aboutText: event.aboutLong ?? event.description,
    heroUri: event.heroImageUrl ?? DEFAULT_HERO,
    mapUri: `https://maps.google.com/maps?q=${encodeURIComponent(event.location || "community center")}&z=14&output=embed`,
    organizer: event.organizerName ?? "Evently Host",
    organizerAvatar: event.organizerAvatarUrl ?? "https://i.pravatar.cc/200?u=default",
  };
}

export function EventDetailsScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "EventDetails">) {
  const event = getEventById(route.params.eventId);
  const savedEventIds = useWarmthStore((state) => state.savedEventIds);
  const toggleSavedEvent = useWarmthStore((state) => state.toggleSavedEvent);
  const [following, setFollowing] = useState(false);

  if (!event) {
    return (
      <WarmthShell
        title="Evently"
        leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
      >
        <Text style={styles.subtitle}>Event not found.</Text>
      </WarmthShell>
    );
  }

  const d = getEventDetailModel(event);
  const isSaved = savedEventIds.includes(event.id);

  return (
    <WarmthShell
      title="Evently"
      leftAction={
        <Pressable onPress={() => navigation.goBack()} style={styles.eventHeaderIcon} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={warmthColors.text} />
        </Pressable>
      }
      rightAction={
        <Pressable
          onPress={() =>
            Share.share({
              title: event.title,
              message: `${event.title} — ${event.dateLabel} at ${event.location}`,
            })
          }
          style={styles.eventHeaderIcon}
          hitSlop={10}
        >
          <MaterialCommunityIcons name="share-variant-outline" size={22} color={warmthColors.text} />
        </Pressable>
      }
      contentStyle={styles.eventDetailScroll}
    >
      <View style={styles.eventHeroWrap}>
        <Image source={{ uri: d.heroUri }} style={styles.eventHeroImg} />
        <Pressable
          style={styles.eventHeroHeart}
          onPress={() => toggleSavedEvent(event.id)}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={isSaved ? "heart" : "heart-outline"}
            size={22}
            color={isSaved ? warmthColors.orange : "#5d2f00"}
          />
        </Pressable>
      </View>

      <View style={styles.eventBody}>
        <View style={styles.eventPillRow}>
          <View style={styles.eventCatPill}>
            <Text style={styles.eventCatPillText}>{event.category}</Text>
          </View>
          <View style={styles.eventPricePill}>
            <MaterialCommunityIcons name="tag-outline" size={16} color="#5d2f00" />
            <Text style={styles.eventPricePillText}>{event.priceLabel}</Text>
          </View>
        </View>

        <Text style={styles.eventDetailTitle}>{event.title}</Text>
        <Text style={styles.eventDetailSummary}>{d.summary}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBadge}>
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={warmthColors.deep} />
          </View>
          <View style={styles.infoCardTextBlock}>
            <Text style={styles.infoCardLabel}>Date & Time</Text>
            <Text style={styles.infoCardLine}>{d.dateDetail}</Text>
            <Text style={styles.infoCardLineMuted}>{d.timeRange}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBadge}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={warmthColors.deep} />
          </View>
          <View style={styles.infoCardTextBlock}>
            <Text style={styles.infoCardLabel}>Location</Text>
            <Text style={styles.infoCardLine}>{event.location}</Text>
          </View>
        </View>

        <Pressable
          style={styles.bookCta}
          onPress={() => navigation.navigate("BookingForm", { eventId: event.id })}
        >
          <Text style={styles.bookCtaText}>Book Now</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
        </Pressable>

        <View style={styles.organizerRow}>
          <Image source={{ uri: d.organizerAvatar }} style={styles.organizerAvatar} />
          <Text style={styles.organizerName} numberOfLines={2}>
            Organized by {d.organizer}
          </Text>
          <Pressable
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={() => setFollowing((f) => !f)}
          >
            <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
              {following ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHead}>About this Event</Text>
        <Text style={styles.aboutBody}>{d.aboutText}</Text>

        <Text style={styles.sectionHead}>Getting there</Text>
        <View style={styles.mapCard}>
          <WebView source={{ uri: d.mapUri }} style={styles.mapWebView} />
        </View>
        <WarmthButton label="Open in maps" onPress={() => openNativeMap(event.location)} />
      </View>
    </WarmthShell>
  );
}

export function BookingFormScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "BookingForm">) {
  const event = getEventById(route.params.eventId);
  const token = useAuthStore((s) => s.token);
  const addTicketForEvent = useWarmthStore((state) => state.addTicketForEvent);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  if (!event) {
    return (
      <WarmthShell
        title="Booking"
        leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
      >
        <Text style={styles.subtitle}>Event not found.</Text>
      </WarmthShell>
    );
  }

  return (
    <WarmthShell
      title="Booking"
      leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
    >
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.subtitle}>Step 1 of 3: Let's get to know you.</Text>
      <WarmthField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />
      <WarmthField label="Age" value={age} onChangeText={setAge} placeholder="e.g. 65" />
      <WarmthField label="Gender" value={gender} onChangeText={setGender} placeholder="Select gender" />
      <WarmthField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="(555) 000-0000" />
      <WarmthButton
        label="Continue"
        primary
        onPress={async () => {
          if (!token) {
            Alert.alert("Sign in required", "Please log in from the Profile tab after verifying your phone or email.");
            return;
          }
          if (!fullName || !age || !gender || !phone) {
            Alert.alert("Missing details", "Please fill all fields.");
            return;
          }
          try {
            const ticket = await addTicketForEvent(event.id, fullName);
            navigation.navigate("QRTicket", {
              eventId: event.id,
              attendeeName: fullName,
              ticketId: ticket.ticketId,
            });
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            Alert.alert("Booking failed", err?.response?.data?.message ?? err?.message ?? "Try again.");
          }
        }}
      />
    </WarmthShell>
  );
}

export function QRTicketScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, "QRTicket">) {
  const event = getEventById(route.params.eventId);
  const tickets = useWarmthStore((state) => state.tickets ?? []);
  const [selectedTicketId, setSelectedTicketId] = useState(route.params.ticketId);
  const [saveOffline, setSaveOffline] = useState(true);
  const selectedTicket = tickets.find((ticket) => ticket.ticketId === selectedTicketId);
  const eventTickets = tickets.filter((ticket) => ticket.eventId === route.params.eventId);
  const ticketPayload = JSON.stringify({
    ticketId: selectedTicket?.ticketId ?? route.params.ticketId,
    eventId: route.params.eventId,
    attendeeName: selectedTicket?.attendeeName ?? route.params.attendeeName,
  });

  return (
    <WarmthShell
      title="My Ticket"
      leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
      rightAction={
        <WarmthHeaderAction label="More" />
      }
    >
      <View style={styles.qrTicketCard}>
        <View style={styles.qrHero}>
          <View style={styles.vipPill}>
            <Text style={styles.vipPillText}>VIP Pass</Text>
          </View>
          <Text style={styles.qrHeroTitle}>Autumn Jazz Fest</Text>
          <Text style={styles.qrHeroSubtitle}>{event?.location ?? "Riverside Park Amphitheater"}</Text>

          <View style={styles.qrHeroStats}>
            <View style={styles.qrHeroStat}>
              <Text style={styles.qrHeroStatLabel}>Date</Text>
              <Text style={styles.qrHeroStatValue}>Oct{"\n"}24</Text>
            </View>
            <View style={styles.qrHeroStat}>
              <Text style={styles.qrHeroStatLabel}>Time</Text>
              <Text style={styles.qrHeroStatValue}>7:00{"\n"}PM</Text>
            </View>
            <View style={styles.qrHeroStat}>
              <Text style={styles.qrHeroStatLabel}>Gate</Text>
              <Text style={styles.qrHeroStatValue}>North</Text>
            </View>
          </View>
        </View>

        <View style={styles.qrBody}>
          <Text style={styles.qrScanText}>Scan at the entrance</Text>

          <View style={styles.qrBox}>
            <View style={styles.qrInner}>
              <QRCode value={ticketPayload} size={160} backgroundColor="#fff" color="#111827" />
            </View>
          </View>

          <View style={styles.qrCodePill}>
            <Text style={styles.qrCodeText}>{selectedTicket?.ticketId ?? route.params.ticketId}</Text>
          </View>

          <View style={styles.qrConfirmedRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#914d00" />
            <Text style={styles.qrConfirmedText}>Ticket Confirmed</Text>
          </View>
        </View>
      </View>

      <View style={styles.qrControlsCard}>
        <Pressable style={styles.qrToggleRow} onPress={() => setSaveOffline((prev) => !prev)}>
          <View style={styles.qrToggleInfo}>
            <View style={styles.qrToggleIconBadge}>
              <MaterialCommunityIcons name="download" size={16} color="#914d00" />
            </View>
            <View>
              <Text style={styles.qrToggleTitle}>Save Offline</Text>
              <Text style={styles.qrToggleSubtitle}>Access ticket without internet</Text>
            </View>
          </View>

          <View style={[styles.qrSwitchTrack, saveOffline && styles.qrSwitchTrackActive]}>
            <View style={[styles.qrSwitchKnob, saveOffline && styles.qrSwitchKnobActive]} />
          </View>
        </Pressable>

        <Pressable style={styles.qrWalletButton}>
          <MaterialCommunityIcons name="wallet-outline" size={18} color="#914d00" />
          <Text style={styles.qrWalletText}>Add to Apple Wallet</Text>
        </Pressable>
        <Pressable style={styles.qrWalletButton} onPress={() => navigation.navigate("TicketScanner")}>
          <MaterialCommunityIcons name="qrcode-scan" size={18} color="#914d00" />
          <Text style={styles.qrWalletText}>Scan Ticket</Text>
        </Pressable>
      </View>

      {eventTickets.length > 1 ? (
        <View style={styles.qrStackSection}>
          <Text style={styles.qrStackTitle}>Your Tickets</Text>
          {eventTickets.map((ticket, index) => {
            const active = ticket.ticketId === selectedTicketId;
            return (
              <Pressable
                key={ticket.ticketId}
                onPress={() => setSelectedTicketId(ticket.ticketId)}
                style={[
                  styles.qrStackCard,
                  { marginTop: index === 0 ? 0 : -14, zIndex: 50 - index },
                  active && styles.qrStackCardActive,
                ]}
              >
                <View style={styles.qrStackTopRow}>
                  <Text style={styles.qrStackTicketCode}>{ticket.ticketId}</Text>
                  <Text style={styles.qrStackStatus}>{active ? "Active" : "Tap to view"}</Text>
                </View>
                <Text style={styles.qrStackMeta}>Attendee: {ticket.attendeeName}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </WarmthShell>
  );
}

export function TicketScannerScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "TicketScanner">) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [resultMessage, setResultMessage] = useState("Point camera at a ticket QR code.");

  const verifyScannedCode = async (rawValue: string) => {
    if (busy) return;
    setBusy(true);
    try {
      let ticketId = rawValue;
      try {
        const parsed = JSON.parse(rawValue) as { ticketId?: string };
        if (parsed?.ticketId) ticketId = parsed.ticketId;
      } catch {
        /* plain string QR is allowed */
      }

      const { data } = await api.post<{
        valid: boolean;
        ticket: { ticketId: string; attendeeName: string };
        event: { title: string; location: string; date: string };
      }>("/tickets/verify", { ticketId });

      if (data.valid) {
        setResultMessage(
          `Valid ticket: ${data.ticket.ticketId}\n${data.ticket.attendeeName} • ${data.event.title}`
        );
        Alert.alert(
          "Ticket verified",
          `${data.ticket.attendeeName}\n${data.event.title}\n${data.event.date} • ${data.event.location}`
        );
      } else {
        setResultMessage("Ticket invalid");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setResultMessage(`Verification failed: ${err?.response?.data?.message ?? "Unknown error"}`);
    } finally {
      setTimeout(() => setBusy(false), 1200);
    }
  };

  if (!permission) {
    return (
      <WarmthShell title="Scan Ticket" leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}>
        <Text style={styles.subtitle}>Loading camera permissions…</Text>
      </WarmthShell>
    );
  }

  if (!permission.granted) {
    return (
      <WarmthShell title="Scan Ticket" leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}>
        <Text style={styles.subtitle}>Camera access is required for QR scanning.</Text>
        <WarmthButton label="Allow Camera" primary onPress={() => requestPermission()} />
      </WarmthShell>
    );
  }

  return (
    <WarmthShell title="Scan Ticket" leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}>
      <View style={styles.scanCameraWrap}>
        <CameraView
          style={styles.scanCamera}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => verifyScannedCode(data)}
        />
      </View>
      <Text style={styles.subtitle}>{resultMessage}</Text>
    </WarmthShell>
  );
}

export function OfflineHubScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "OfflineHub">) {
  const events = useWarmthStore((state) => state.events);
  const savedEventIds = useWarmthStore((state) => state.savedEventIds);
  const tickets = useWarmthStore((state) => state.tickets ?? []);
  const savedEvents = events.filter((event) => savedEventIds.includes(event.id));
  const firstTicket = tickets[0];

  return (
    <WarmthShell
      title="Events"
      rightAction={<WarmthHeaderAction label="Profile" onPress={() => navigation.navigate("Profile")} />}
      bottomBar={attendeeBottomBar("saved", navigation, firstTicket)}
    >
      <View style={[styles.card, { backgroundColor: "#fff3e6" }]}>
        <Text style={[styles.subtitle, { color: "#5d2f00" }]}>
          Saved events and tickets sync from your account when you are online.
        </Text>
      </View>
      <Text style={[styles.title, styles.sectionGap]}>Saved Events</Text>
      {savedEvents.map((event) => (
        <Pressable key={event.id} style={styles.card} onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <Text style={styles.cardMeta}>{event.dateLabel}</Text>
        </Pressable>
      ))}

      <Text style={[styles.title, styles.sectionGap]}>Saved Tickets</Text>
      {tickets.length === 0 ? (
        <Text style={styles.subtitle}>No tickets yet.</Text>
      ) : (
        tickets.map((ticket) => {
          const eventForTicket = events.find((event) => event.id === ticket.eventId);
          return (
            <Pressable
              key={ticket.ticketId}
              style={styles.ticketListCard}
              onPress={() =>
                navigation.navigate("QRTicket", {
                  eventId: ticket.eventId,
                  attendeeName: ticket.attendeeName,
                  ticketId: ticket.ticketId,
                })
              }
            >
              <Text style={styles.ticketListCode}>{ticket.ticketId}</Text>
              <Text style={styles.ticketListMeta}>{eventForTicket?.title ?? "Event"}</Text>
              <Text style={styles.ticketListMeta}>Attendee: {ticket.attendeeName}</Text>
            </Pressable>
          );
        })
      )}

      <View style={styles.rowWrap}>
        <WarmthButton label="Ticket Limits" onPress={() => navigation.navigate("TicketLimits")} />
        <WarmthButton
          label="Edit Event"
          onPress={() => {
            const target = events[0];
            if (!target) {
              Alert.alert("No events", "Create or load an event first.");
              return;
            }
            navigation.navigate("EditEvent", { eventId: target.id });
          }}
        />
      </View>
    </WarmthShell>
  );
}

export function TicketLimitsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "TicketLimits">) {
  const total = useWarmthStore((state) => state.totalCapacity);
  const early = useWarmthStore((state) => state.earlyBirdLimit);
  const updateTicketLimits = useWarmthStore((state) => state.updateTicketLimits);
  const regular = total - early;
  return (
    <WarmthShell
      title="Event Helper"
      leftAction={<WarmthHeaderAction label="Menu" />}
      rightAction={<WarmthHeaderAction label="Profile" />}
      bottomBar={organizerBottomBar("tickets", navigation)}
    >
      <Text style={styles.title}>Ticket Limits</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Capacity: {total}</Text>
        <View style={styles.row}>
          <WarmthButton label="-10" onPress={() => updateTicketLimits(total - 10, early)} />
          <WarmthButton label="+10" onPress={() => updateTicketLimits(total + 10, early)} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Early-Bird: {early}</Text>
        <View style={styles.row}>
          <WarmthButton label="-5" onPress={() => updateTicketLimits(total, early - 5)} />
          <WarmthButton label="+5" onPress={() => updateTicketLimits(total, early + 5)} />
        </View>
        <Text style={styles.subtitle}>{regular} regular tickets remaining</Text>
      </View>
      <WarmthButton label="Save Limits" primary onPress={() => navigation.goBack()} />
    </WarmthShell>
  );
}

export function CreateEventScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "CreateEvent">) {
  const token = useAuthStore((s) => s.token);
  const createEvent = useWarmthStore((state) => state.createEvent);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Social");
  /** ISO date for API (YYYY-MM-DD) */
  const [dateYmd, setDateYmd] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <WarmthShell
      title="Event Helper"
      leftAction={<WarmthHeaderAction label="Menu" />}
      rightAction={<WarmthHeaderAction label="Profile" />}
      bottomBar={organizerBottomBar("create", navigation)}
    >
      <Text style={styles.title}>Create New Event</Text>
      <WarmthField label="Event Name" value={title} onChangeText={setTitle} placeholder="e.g., Weekly Book Club" />
      <WarmthField label="Category" value={category} onChangeText={setCategory} placeholder="Social / Health / Arts / Learning" />
      <WarmthField
        label="Event date (YYYY-MM-DD)"
        value={dateYmd}
        onChangeText={setDateYmd}
        placeholder="2026-05-06"
      />
      <WarmthField
        label="Date & time (shown on card)"
        value={dateLabel}
        onChangeText={setDateLabel}
        placeholder="Sat, May 6 • 10:00 AM"
      />
      <WarmthField label="Location" value={location} onChangeText={setLocation} placeholder="Address or link" />
      <WarmthField label="Description" value={description} onChangeText={setDescription} placeholder="What should people expect?" />
      <WarmthButton
        label={submitting ? "Creating…" : "Create Event"}
        primary
        onPress={async () => {
          if (!token) {
            Alert.alert("Sign in required", "Log in to publish an event.");
            return;
          }
          if (!title || !dateYmd || !location) {
            Alert.alert("Missing info", "Title, event date (YYYY-MM-DD), and location are required.");
            return;
          }
          setSubmitting(true);
          try {
            const newId = await createEvent({
              title,
              category: (["Arts", "Health", "Social", "Learning", "Technology"].includes(category)
                ? category
                : "Social") as
                | "Arts"
                | "Health"
                | "Social"
                | "Learning"
                | "Technology",
              dateLabel: dateLabel || dateYmd,
              location,
              priceLabel: "$10",
              description: description || "No description yet.",
              date: dateYmd,
              dateDetail: dateLabel || undefined,
            });
            navigation.replace("EditEvent", { eventId: newId });
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            Alert.alert("Could not create", err?.response?.data?.message ?? err?.message ?? "Try again.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </WarmthShell>
  );
}

export function EditEventScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, "EditEvent">) {
  const token = useAuthStore((s) => s.token);
  const event = useWarmthStore((state) => state.events.find((item) => item.id === route.params.eventId));
  const updateEvent = useWarmthStore((state) => state.updateEvent);
  const [title, setTitle] = useState(event?.title ?? "");
  const [category, setCategory] = useState<string>(event?.category ?? "Social");
  const [dateYmd, setDateYmd] = useState(event?.apiDate ?? "");
  const [dateLabel, setDateLabel] = useState(event?.dateLabel ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <WarmthShell
      title="Event Helper"
      leftAction={<WarmthHeaderAction label="Back" onPress={() => navigation.goBack()} />}
      rightAction={<WarmthHeaderAction label="Profile" />}
    >
      <Text style={styles.title}>Edit Event</Text>
      <WarmthField label="Event Name" value={title} onChangeText={setTitle} placeholder="Event name" />
      <WarmthField label="Category" value={category} onChangeText={setCategory} placeholder="Category" />
      <WarmthField label="Event date (YYYY-MM-DD)" value={dateYmd} onChangeText={setDateYmd} placeholder="YYYY-MM-DD" />
      <WarmthField label="Date & time (card)" value={dateLabel} onChangeText={setDateLabel} placeholder="Date & time" />
      <WarmthField label="Location" value={location} onChangeText={setLocation} placeholder="Location" />
      <WarmthField label="Description" value={description} onChangeText={setDescription} placeholder="Description" />
      <WarmthButton
        label={saving ? "Saving…" : "Save Changes"}
        primary
        onPress={async () => {
          if (!token) {
            Alert.alert("Sign in required", "Log in to save changes.");
            return;
          }
          if (!event) {
            Alert.alert("Error", "Event not found.");
            return;
          }
          if (!dateYmd) {
            Alert.alert("Missing date", "Enter the event date as YYYY-MM-DD.");
            return;
          }
          setSaving(true);
          try {
            await updateEvent(event.id, {
              title,
              category: (["Arts", "Health", "Social", "Learning", "Technology"].includes(category)
                ? category
                : "Social") as
                | "Arts"
                | "Health"
                | "Social"
                | "Learning"
                | "Technology",
              dateLabel,
              location,
              priceLabel: event.priceLabel,
              description,
              apiDate: dateYmd,
              dateDetail: dateLabel,
            });
            navigation.replace("HomeFeed");
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            Alert.alert("Save failed", err?.response?.data?.message ?? err?.message ?? "Try again.");
          } finally {
            setSaving(false);
          }
        }}
      />
      <WarmthButton label="Cancel Editing" onPress={() => navigation.goBack()} />
    </WarmthShell>
  );
}

const styles = StyleSheet.create({
  eventHeaderIcon: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDetailScroll: {
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 32,
    gap: 0,
  },
  eventHeroWrap: {
    width: "100%",
    position: "relative",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  eventHeroImg: {
    width: "100%",
    height: 220,
    backgroundColor: "#ece8e2",
  },
  eventHeroHeart: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1e3d7",
  },
  eventBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  eventPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  eventCatPill: {
    backgroundColor: warmthColors.orange,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  eventCatPillText: {
    color: "#5d2f00",
    fontWeight: "700",
    fontSize: 14,
  },
  eventPricePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f7ede3",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ecdccc",
  },
  eventPricePillText: {
    color: warmthColors.deep,
    fontWeight: "700",
    fontSize: 15,
  },
  eventDetailTitle: {
    color: warmthColors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  eventDetailSummary: {
    color: warmthColors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#f0e0d2",
    padding: 16,
  },
  infoIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffedd5",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardTextBlock: {
    flex: 1,
    gap: 4,
  },
  infoCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9a8574",
  },
  infoCardLine: {
    fontSize: 17,
    fontWeight: "700",
    color: warmthColors.text,
  },
  infoCardLineMuted: {
    fontSize: 15,
    color: warmthColors.muted,
  },
  bookCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5a2b00",
    minHeight: 60,
    borderRadius: 999,
    borderWidth: 0,
  },
  bookCtaText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  organizerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#e8e0d8",
  },
  organizerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: warmthColors.text,
  },
  followBtn: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: warmthColors.deep,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  followBtnActive: {
    backgroundColor: "#fff3e6",
  },
  followBtnText: {
    color: warmthColors.deep,
    fontWeight: "800",
    fontSize: 15,
  },
  followBtnTextActive: {
    color: warmthColors.deep,
  },
  sectionHead: {
    fontSize: 20,
    fontWeight: "800",
    color: warmthColors.text,
    marginTop: 4,
  },
  aboutBody: {
    fontSize: 16,
    lineHeight: 25,
    color: warmthColors.muted,
  },
  mapCard: {
    borderRadius: 24,
    overflow: "hidden",
    height: 200,
    backgroundColor: "#e5dfd6",
    marginBottom: 8,
  },
  mapWebView: {
    width: "100%",
    height: "100%",
  },
  loginShellContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 28,
    paddingBottom: 40,
  },
  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 42,
    borderWidth: 1,
    borderColor: "#f2e8df",
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 16,
    shadowColor: "#f28c28",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  loginIconBadge: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#f28c28",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loginBrand: {
    alignSelf: "center",
    color: "#914d00",
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginSubtitle: {
    textAlign: "center",
    color: warmthColors.muted,
    fontSize: 18,
    lineHeight: 28,
    marginTop: -2,
  },
  loginToggle: {
    flexDirection: "row",
    backgroundColor: "#f3f3f4",
    borderRadius: 999,
    padding: 6,
    gap: 8,
    marginTop: 6,
  },
  loginToggleChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  loginToggleChipActive: {
    backgroundColor: "#f28c28",
  },
  loginToggleText: {
    color: "#554336",
    fontSize: 18,
    fontWeight: "700",
  },
  loginToggleTextActive: {
    color: "#5d2f00",
  },
  loginFieldWrap: {
    gap: 8,
    marginTop: 4,
  },
  loginInputRow: {
    borderWidth: 1,
    borderColor: "#dbc2b0",
    borderRadius: 999,
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
  },
  loginInput: {
    flex: 1,
    color: warmthColors.text,
    fontSize: 18,
    paddingVertical: 0,
  },
  loginLegal: {
    marginTop: 12,
    textAlign: "center",
    color: "#554336",
    fontSize: 16,
    lineHeight: 24,
  },
  loginLegalLink: {
    color: "#914d00",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  label: {
    color: warmthColors.muted,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: warmthColors.text,
    fontSize: 30,
    fontWeight: "700",
  },
  sectionGap: {
    marginTop: 8,
  },
  subtitle: {
    color: warmthColors.muted,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  subtleCenter: {
    textAlign: "center",
    color: warmthColors.muted,
    fontSize: 15,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  rowWrap: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: warmthColors.card,
  },
  chipActive: {
    backgroundColor: warmthColors.orange,
    borderColor: warmthColors.orange,
  },
  chipText: { color: warmthColors.muted, fontWeight: "600" },
  chipTextActive: { color: "#5d2f00" },
  otpInput: {
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 18,
    minHeight: 72,
    backgroundColor: warmthColors.card,
    color: warmthColors.text,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 8,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 24,
    backgroundColor: warmthColors.card,
    padding: 16,
    gap: 10,
  },
  cardImage: {
    height: 130,
    borderRadius: 16,
    backgroundColor: "#ececec",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: warmthColors.text,
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  cardMeta: {
    color: warmthColors.muted,
    fontSize: 15,
  },
  price: {
    color: warmthColors.deep,
    fontWeight: "700",
    fontSize: 16,
  },
  saveBtn: {
    color: warmthColors.orange,
    fontWeight: "700",
    fontSize: 15,
  },
  otpBox: {
    width: 64,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: warmthColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: warmthColors.card,
  },
  otpText: {
    color: warmthColors.text,
    fontSize: 32,
    fontWeight: "700",
  },
  link: { color: warmthColors.deep, fontWeight: "700" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  qrTicketCard: {
    backgroundColor: "#fff",
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "#f2e4d7",
    overflow: "hidden",
    shadowColor: "#f28c28",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  qrHero: {
    backgroundColor: "#f28c28",
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "center",
    gap: 10,
  },
  vipPill: {
    backgroundColor: "#f6c38d",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  vipPillText: {
    color: "#5d2f00",
    fontWeight: "700",
    fontSize: 16,
  },
  qrHeroTitle: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 48,
  },
  qrHeroSubtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 18,
    textAlign: "center",
  },
  qrHeroStats: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 10,
  },
  qrHeroStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  qrHeroStatLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  qrHeroStatValue: {
    color: "#fff",
    fontSize: 30,
    textAlign: "center",
    fontWeight: "800",
    lineHeight: 34,
  },
  qrBody: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: "center",
    gap: 14,
  },
  qrScanText: {
    fontSize: 18,
    color: "#1a1c1c",
    fontWeight: "600",
  },
  qrBox: {
    borderWidth: 1,
    borderColor: "#dbc2b0",
    borderRadius: 36,
    padding: 14,
    backgroundColor: "#fff",
  },
  qrInner: {
    width: 192,
    height: 192,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCodePill: {
    backgroundColor: "#efefef",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  qrCodeText: {
    color: "#1a1c1c",
    letterSpacing: 1,
    fontSize: 24,
    fontWeight: "700",
  },
  qrConfirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrConfirmedText: {
    color: "#914d00",
    fontWeight: "700",
    fontSize: 16,
  },
  qrControlsCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1e3d7",
    borderRadius: 30,
    padding: 14,
    gap: 10,
  },
  qrToggleRow: {
    borderWidth: 1,
    borderColor: "#f1e3d7",
    borderRadius: 999,
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qrToggleIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#f7e6d3",
    alignItems: "center",
    justifyContent: "center",
  },
  qrToggleTitle: {
    fontSize: 16,
    color: "#1a1c1c",
    fontWeight: "700",
  },
  qrToggleSubtitle: {
    fontSize: 14,
    color: "#554336",
  },
  qrSwitchTrack: {
    width: 54,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#e8e8e8",
    padding: 3,
    justifyContent: "center",
  },
  qrSwitchTrackActive: {
    backgroundColor: "#f28c28",
  },
  qrSwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  qrSwitchKnobActive: {
    alignSelf: "flex-end",
  },
  qrWalletButton: {
    minHeight: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e8d8c8",
    backgroundColor: "#efefef",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  qrWalletText: {
    color: "#914d00",
    fontSize: 18,
    fontWeight: "700",
  },
  qrStackSection: {
    marginTop: 10,
    gap: 8,
    paddingBottom: 8,
  },
  qrStackTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: warmthColors.text,
  },
  qrStackCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ecdccc",
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  qrStackCardActive: {
    borderColor: warmthColors.orange,
    shadowColor: "#f28c28",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  qrStackTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrStackTicketCode: {
    color: "#1a1c1c",
    fontWeight: "700",
    fontSize: 16,
  },
  qrStackStatus: {
    color: warmthColors.orange,
    fontWeight: "700",
    fontSize: 13,
  },
  qrStackMeta: {
    color: warmthColors.muted,
    fontSize: 14,
  },
  scanCameraWrap: {
    width: "100%",
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: warmthColors.border,
  },
  scanCamera: {
    flex: 1,
  },
  ticketListCard: {
    borderWidth: 1,
    borderColor: warmthColors.border,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 12,
    gap: 2,
  },
  ticketListCode: {
    color: warmthColors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  ticketListMeta: {
    color: warmthColors.muted,
    fontSize: 14,
  },
});
