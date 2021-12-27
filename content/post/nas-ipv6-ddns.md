+++
title = "Making Synology NAS accessible from the Internet using IPv6 and DDNS"
subtitle = "IPv6 Yes! :-)"
author = "Zhenghao Wu"
description = "Making Synology NAS accessible from the Internet using IPv6 and DDNS"
tags = [
    "NAS",
    "Synology",
    "DS918+",
    "DDNS",
    "Networking",
    "Cloudflare",
    "Domain",
    "HTTPS"
]
date = "2021-04-04T10:01:01+08:00"
categories = [
    "Note",
    "Website",
]
menu = "main"
meta = true
hideDate = false
hideReadTime = true
draft = false
math = false
toc = true
+++

> Although I majored in computer science, my blog is filled with photography-related content. For balance, I take the opportunity of a recent explore and write down this note. :-)

> Spoiler alert: This is not the way I currently using to exposed my NAS to the WWW.

## Some Background

I own a Synology DS918+ NAS, which was purchased in 2020. Both ports on the NAS are connected to my ASUS AC68U router for redundancy. The ISP in my house is CMCC {{% sidenote "cmcc-full-name" %}}
China Mobile Limited; Chinese: 中国移动通信集团有限公司{{% /sidenote %}}, so no dedicated IPv4 address. 

For most cases, the [Synology QuickConnect](https://quickconnect.to/) service can serve my need. Until I live in Hong Kong for postgraduate study. The service is unusable most of the time. 

Since the MIIT {{% sidenote "miit-full-name" %}}
Ministry of Industry and Information Technology{{% /sidenote %}} already pushing IPv6 landing for years, and some recent IPv6 trials with my friends reported some positive results (i.e. accessible cross different ISP; port 80, 443 are not blocked). So, why not make the NAS accessible from the Internet via IPv6.

## Idea

So the plan is to bind the IPv6 address for the NAS to a domain of mine. Which divide into steps:

- Configure the IPv6 firewall setting on the router, make sure the NAS can access via the IPv6 address.
- IPv6 address for the NAS would change, update the AAAA record with DDNS.
- HTTPS certificate for the domain.
- Security enhancement for the Synology DSM.

I try to avoid handcraft solutions, so the DSM built-in DDNS tool is the first choice, but the DNS I am using is Cloudflare, which isn't supported. I tried one [solution](https://github.com/joshuaavalon/SynologyCloudflareDDNS) which can add Cloudflare DDNS support, but the IPv6 address is not passing from the DSM and the script is not working.

So, I change the plan. Setup a Synology DDNS (a service provided by Synology) first, then create a CNAME rule direct to the Synology URL (the second step will divide into two): 

- Previous: ~~Update the AAAA record with DDNS~~
- New:
    - Setup Synology DDNS
    - Setup CNAME to the Synology DDNS URL in the DNS provider (Cloudflare in this case)

## Implementations

### A. Firewall

> The router in my house is Asus AC68U and I use it for demonstration.

For IPv6 firewall settings, go to `Advanced Settings > Firewall > IPv6 Firewall`. You need to set up `Inbound Firewall Rules` to expose the service port on your NAS to IPv6. But the problem is how to fill in these rules.

There are five fields for each rule: 
- `Service Name`: Name of your rule, you can keep it empty.
- `Remote IP/CIDR`: Allowed request IP/CIDR, you can keep it empty if there are no limits.
- `Local IP`: What local IP is allowed for access, you need to set it to the address of your NAS IP (v6).
- `Port Range`: What port is allowed for access, this one has to set according to your service.
- `Protocol`: Protocol for this rules, default is `TCP`, just keep it this way.

Usually, you just need to set `Local IP` and `Port Range`.

#### A.1. `Local IP`
Assuming the IPv6 IP for the NAS is `2001:0db8:85a3:0000:0000:8a2e:0370:7334`, you can fill in `::0000:8a2e:0370:7334/::ffff:ffff:ffff:ffff` in the `Local IP` field.

#### A.2. `Port Range`
Just fill in the port of the service you want to allow access to. Here are some of the ports on the Synology NAS.

- Synology DSM (http): `5000`
- Synology DSM (https): `5001`
- Web: `80`
- ssh: `22`

You can fill in multiple port by range (i.e. `80-5001`), or input multiple ports and divide them by comma (i.e. `80,443,5000`)

#### A.3. One example

- `Service Name`: (Keep it empty)
- `Remote IP/CIDR`: (Keep it empty)
- `Local IP`: `::0000:8a2e:0370:7334/::ffff:ffff:ffff:ffff`
- `Port Range`: `80,443,5000,5001`
- `Protocol`: `TCP`

#### A.4. Tips

- Rules do not allow changes once it saved and display for those existing rules will truncate those long IP (like the `Local IP` field). Make sure you have an backup of your settings.
- You can just turn off the IPv6 Firewall (any requests are allowed) for debugging purposes, but a proper firewall setting is strongly recommended for production environments.

### B. Synology DDNS

> Steps are based on the article from Synology Knowledge Base: [DDNS > Setting up DDNS](https://www.synology.com/en-global/knowledgebase/DSM/help/DSM/AdminCenter/connection_ddns)

You can point an existing hostname at the IP address of your Synology NAS, or register for a new one provided by Synology or several other DDNS providers. Please consult each provider for more details regarding hostname registration.

To set up a DDNS hostname, first go to the DDNS settings `Control Panel > Connectivity > External Access > DDNS`:
1. Click the Add button.
2. A dialog box appears prompting you to edit the following settings:
    - Service provider: Choose Synology from the drop-down menu for a free hostname provided by Synology.
    - Hostname: Enter a registered DDNS hostname, such as `john.synology.me`.
    - Email: Will be auto fill in by the DSM.
    - External address: Set IPv4 to 0.0.0.0 and leave IPv6 as default (System should automatically fill in the IPv6 address).
    - Heartbeat: Enable it.
3. Click Test Connection to see if settings are correct.
4. Click OK to save and finish.
5. If you have selected Synology as the service provider, a message box will appear if there's no matching SSL certificate for your DDNS hostname, recommending you to sign a Let’s Encrypt certificate for the hostname and set it as the default certificate. Click No, will cover this in Part D.

- After setup is complete, you can access your Synology NAS over the Internet by entering the DDNS hostname in a web browser.

### C. Configuring DNS (Cloudflare)

Now, you should be able to access the synology DSM via `john.synology.me`. We can add some DNS configurations so you can access the site from your own domain.

I am using the free plan from Cloudflare. A CNAME record is what we need. In my case, I just add one new CNAME record with `Name: mynas`, `Target: john.synology.me`, `TTL: Auto`, `Proxy status: DNS only`. 

After you save the new record and wait for some second for the Cloudflare to flush their record. You can access the synology DSM via `mynas.yourdomain.com`

#### C.1. Enable DNSSEC

DNSSEC {{% sidenote "dnssec-full-name" %}}
Domain Name System Security Extensions{{% /sidenote %}} uses public-key cryptography to ensure the security of DNS resolving the domain name.

I also noticed that I need to enable DNSSEC so that I can successfully apply a free certificate from Let's Encrypt (Cover in Part D). 

If your domain is host by Cloudflare, this should be very easy. But this is not the case (like me), you have to add another DS record to your domain registrar. You can check the [document](https://support.cloudflare.com/hc/en-us/articles/360006660072-Understanding-and-configuring-DNSSEC-in-Cloudflare-DNS) from Cloudflare for more details.

### D. HTTPS Certificate

It will more safe to enable HTTPS certificate for the DSM. And we will choice the free SSL/TLS certificates from Let's Encrypt. This can be done via the GUI in the DSM.

> Steps are based on the article from Synology Knowledge Base: [Certificate > Certificates from Let's Encrypt](https://www.synology.com/en-global/knowledgebase/DSM/help/DSM/AdminCenter/connection_certificate)

First go to the UI: `Control Panel > Security > Certificate`.

1. Click Add.
2. Select Add a new certificate and click Next.
3. Select Get a certificate from Let's Encrypt.
4. Enter the following information:
    - Domain name: Enter the domain you have registered from the domain provider, here we use `mynas.yourdomain.com` as example.
    - Email: Enter the email address used for certificate registration.
    - Subject Alternative Name: Keep it blank.
5. Click Apply to save the settings. Once confirmed, the certificate will be instantly imported into your Synology NAS.

Now, when you access your NAS via `mynas.yourdomain.com`, the traffic is encrypted.

### E. Security Enhancement

If you expose your server to the Internet, there will be unavoidable crawlers, port scanners, enumeration attackers try to access your NAS without your condonement. If you are using some weak passwords or there are some weaknesses in the system, your device and data will be in threat. There are some of the fixes you can do.

- Remove useless user account
- Increase Password Strength for Admin account
- Enable 2FA for Admin account
  - Steps for above check [here](https://www.synology.com/en-global/knowledgebase/DSM/help/DSM/AdminCenter/file_user_desc) and [here](https://www.synology.com/en-global/knowledgebase/DSM/help/DSM/AdminCenter/file_user_advanced).
- Change default ports for services
  - Like ssh(22), steps can be found [here](https://www.synology.com/cgi/knowledgebase/findHelpFile/dsm/dsm/6.0/enu/6.0-7321/synology_armada370_ds115j/100/AdminCenter/system_terminal.html).


<!-- ---------

## Epilogue -->